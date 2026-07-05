using Application.Core.DTOs.Place;
using Application.Core.Interfaces.OwnerInterfaces;
using AutoMapper;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.OwnerServices
{
    public class PlaceOwnerService : IPlaceOwnerService
    {
        private readonly IPlaceRepository _placeRepo;
        private readonly IQueryableRepository<PlaceAvailability> _availabilityRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public PlaceOwnerService(
            IPlaceRepository placeRepo,
            IQueryableRepository<PlaceAvailability> availabilityRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _placeRepo = placeRepo;
            _availabilityRepo = availabilityRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
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
