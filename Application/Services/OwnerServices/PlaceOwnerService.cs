using Application.Core.DTOs.Place;
using Application.Core.DTOs.CommonDTOs;
using Application.Core.Interfaces.OwnerInterfaces;
using Application.Core.Interfaces.AdminServices;
using Application.Core.Interfaces;
using Application.Core.Interfaces.Auth.OTP;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Application.Core.Helpers;

namespace Application.Services.OwnerServices
{
    public class PlaceOwnerService : IPlaceOwnerService
    {
        private readonly IPlaceRepository _placeRepo;
        private readonly IQueryableRepository<PlaceAvailability> _availabilityRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAdminUserService _adminUserService;
        private readonly ILogger<PlaceOwnerService> _logger;
        private readonly IEmailService _emailService;

        public PlaceOwnerService(
            IPlaceRepository placeRepo,
            IQueryableRepository<PlaceAvailability> availabilityRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IAdminUserService adminUserService,
            ILogger<PlaceOwnerService> logger,
            IEmailService emailService)
        {
            _placeRepo = placeRepo;
            _availabilityRepo = availabilityRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _adminUserService = adminUserService;
            _logger = logger;
            _emailService = emailService;
        }


        // Place CRUD

        public async Task<PlaceDetailsDto> AddNewPlaceAsync(int ownerId, AddPlaceDto dto)
        {
            var place = _mapper.Map<Place>(dto);
            place.OwnerId = ownerId;
            place.Status = PlaceStatus.Pending;   // awaiting admin approval
            place.CreatedAt = DateTime.UtcNow;

            await _placeRepo.AddAsync(place);
            await _unitOfWork.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(dto.AvailableDays))
            {
                await GenerateAvailabilitiesFromWeekdays(place.Id, dto.AvailableDays);
                await _unitOfWork.SaveChangesAsync();
            }

            // Notify all admins that a new place is awaiting review
            _logger.LogInformation("[PlaceOwnerService] Notifying admins about new place '{PlaceName}' (Id={PlaceId}) submitted by OwnerId={OwnerId}",
                place.Name, place.Id, ownerId);

            var admins = await _adminUserService.GetAllInRole(Roles.Admin, 1, 1000);
            _logger.LogInformation("[PlaceOwnerService] Found {AdminCount} admin(s) to notify", admins.Count);

            var title = "New Venue Submission 📥";
            var bodyText = $"Hello Administrator!\n\nA new venue has been submitted on the Forsa platform by a venue owner and is currently awaiting your review and approval. 🔍\n\nPlease log in to the Forsa Administration portal to examine the venue details, pictures, and scheduling parameters.";
            
            var details = new Dictionary<string, string>
            {
                { "Venue Name", place.Name },
                { "Location", place.Location },
                { "Capacity", place.Capacity.ToString() },
                { "Hourly Price", $"${place.HourlyPrice}" },
                { "Daily Price", $"${place.DailyPrice}" },
                { "Submitted At", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm UTC") }
            };

            var htmlBody = EmailTemplateHelper.BuildHtmlTemplate(title, bodyText, details);

            foreach (var admin in admins)
            {
                if (!string.IsNullOrWhiteSpace(admin.Email))
                {
                    try
                    {
                        await _emailService.SendAsync(admin.Email,
                            "New Place Awaiting Approval",
                            htmlBody);
                    }
                    catch{}
                }
            }

            await _unitOfWork.SaveChangesAsync();


            return _mapper.Map<PlaceDetailsDto>(place);
        }

        public async Task<PlaceDetailsDto> UpdatePlaceAsync(int ownerId, int placeId, UpdatePlaceDto dto)
        {
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);

            if (place == null)
                throw new KeyNotFoundException("Place not found or you don't own this place.");

            if (!string.IsNullOrWhiteSpace(dto.Name)) place.Name = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.Location)) place.Location = dto.Location;
            if (dto.Capacity.HasValue) place.Capacity = dto.Capacity.Value;
            if (!string.IsNullOrWhiteSpace(dto.Description)) place.Description = dto.Description;
            if (dto.HourlyPrice.HasValue) place.HourlyPrice = dto.HourlyPrice.Value;
            if (dto.DailyPrice.HasValue) place.DailyPrice = dto.DailyPrice.Value;
            if (dto.FacilityName.HasValue) place.FacilityName = (FacilityName)dto.FacilityName.Value;
            if (dto.Latitude.HasValue) place.Latitude = dto.Latitude.Value;
            if (dto.Longitude.HasValue) place.Longitude = dto.Longitude.Value;
            if (dto.GooglePlaceId != null) place.GooglePlaceId = dto.GooglePlaceId;

            if (dto.AvailableDays != null)
            {
                await GenerateAvailabilitiesFromWeekdays(place.Id, dto.AvailableDays);
            }

            place.LastModifiedAt = DateTime.UtcNow;
            _placeRepo.Update(place);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<PlaceDetailsDto>(place);
        }

        public async Task<bool> DeletePlaceAsync(int ownerId, int placeId)
        {
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);

            if (place == null) return false;

            var availabilities = await _availabilityRepo.GetQueryable()
                .Where(a => a.PlaceId == placeId && !a.IsDeleted)
                .ToListAsync();

            foreach (var availability in availabilities)
            {
                availability.IsDeleted = true;
                availability.DeletedAt = DateTime.UtcNow;
                _availabilityRepo.Update(availability);
            }

            place.IsDeleted = true;
            place.DeletedAt = DateTime.UtcNow;
            _placeRepo.Update(place);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<List<PlaceDetailsDto>> GetOwnerPlacesAsync(int ownerId)
        {
            var places = await _placeRepo.GetQueryable()
                .Include(p => p.PlaceMedias)
                .Where(p => p.OwnerId == ownerId && !p.IsDeleted)
                .ToListAsync();

            return _mapper.Map<List<PlaceDetailsDto>>(places);
        }

        public async Task<PlaceDetailsDto?> GetOwnerPlaceByIdAsync(int ownerId, int placeId)
        {
            var place = await _placeRepo.GetQueryable()
                .Include(p => p.PlaceMedias)
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);

            return place == null ? null : _mapper.Map<PlaceDetailsDto>(place);
        }

        private async Task GenerateAvailabilitiesFromWeekdays(int placeId, string availableDays)
        {
            var weekdays = availableDays.Split(',')
                .Select(d => d.Trim().ToLower())
                .Where(d => !string.IsNullOrEmpty(d))
                .ToList();

            var today = DateTime.UtcNow.Date;

            // Remove previously generated future slots so edits do not leave stale data behind.
            var existingSlots = await _availabilityRepo.GetQueryable()
                .Where(a => a.PlaceId == placeId && a.Status != PlaceStatus.Booked && !a.IsDeleted && a.Date >= today)
                .ToListAsync();

            foreach (var slot in existingSlots)
            {
                slot.IsDeleted = true;
                slot.DeletedAt = DateTime.UtcNow;
                _availabilityRepo.Update(slot);
            }

            if (!weekdays.Any()) return;

            for (int i = 0; i < 7; i++)
            {
                var targetDate = today.AddDays(i);
                var dayName = targetDate.ToString("dddd").ToLower();

                if (weekdays.Contains(dayName))
                {
                    var newSlot = new PlaceAvailability
                    {
                        PlaceId = placeId,
                        Date = targetDate,
                        Status = PlaceStatus.Available,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _availabilityRepo.AddAsync(newSlot);
                }
            }


        }
    }
}
