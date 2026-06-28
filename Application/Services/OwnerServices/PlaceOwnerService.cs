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
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public PlaceOwnerService(
            IPlaceRepository placeRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _placeRepo = placeRepo;
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

            place.IsDeleted = true;
            place.DeletedAt = DateTime.UtcNow;
            _placeRepo.Update(place);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<List<PlaceDetailsDto>> GetOwnerPlacesAsync(int ownerId)
        {
            var places = await _placeRepo.GetQueryable()
                .Where(p => p.OwnerId == ownerId && !p.IsDeleted)
                .ToListAsync();

            return _mapper.Map<List<PlaceDetailsDto>>(places);
        }

        public async Task<PlaceDetailsDto?> GetOwnerPlaceByIdAsync(int ownerId, int placeId)
        {
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);

            return place == null ? null : _mapper.Map<PlaceDetailsDto>(place);
        }
    }
}
