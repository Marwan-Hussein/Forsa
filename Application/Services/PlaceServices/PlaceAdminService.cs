using Application.Core.DTOs.Place;
using Application.Core.Interfaces.PlaceInterfaces;
using AutoMapper;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.PlaceServices
{
    public class PlaceAdminService : IPlaceAdminService
    {
        private readonly IPlaceRepository _placeRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public PlaceAdminService(
            IPlaceRepository placeRepo,
            IFeedbackRepository feedbackRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _placeRepo = placeRepo;
            _feedbackRepo = feedbackRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        // GET /api/admin/places/pending
        public async Task<List<PlaceDetailsDto>> GetPendingPlacesAsync(PlaceSearchParameterDto parameters)
        {
            parameters ??= new PlaceSearchParameterDto();

            var query = _placeRepo.GetQueryable()
                                  .Where(p => !p.IsDeleted && p.Status == PlaceStatus.Pending);

            if (!string.IsNullOrWhiteSpace(parameters.Name))
                query = query.Where(p => p.Name.Contains(parameters.Name));

            if (!string.IsNullOrWhiteSpace(parameters.Location))
                query = query.Where(p => p.Location.Contains(parameters.Location));

            query = parameters.SortBy?.ToLower() switch
            {
                "name" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.Name)
                              : query.OrderBy(p => p.Name),
                "location" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.Location)
                              : query.OrderBy(p => p.Location),
                "date" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.CreatedAt)
                              : query.OrderBy(p => p.CreatedAt),
                _ => query.OrderBy(p => p.Id)
            };

            var places = await query.ToListAsync();
            return _mapper.Map<List<PlaceDetailsDto>>(places);
        }

        // PATCH /api/admin/places/{id}/status
        public async Task<bool> UpdateStatusAsync(int placeId, PlaceStatus status, string? reason)
        {
            var place = await _placeRepo.GetQueryable()
                                        .FirstOrDefaultAsync(p => p.Id == placeId && !p.IsDeleted);
            if (place == null)
                return false;

            // Business rule: a rejection must always carry a reason
            if (status == PlaceStatus.Rejected && string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("A reason must be provided when rejecting a place.");

            place.Status = status;
            place.Reason = reason;
            place.LastModifiedAt = DateTime.UtcNow;

            _placeRepo.Update(place);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        // DELETE /api/admin/reviews/{id}
        public async Task<bool> SoftDeleteFeedbackAsync(int feedbackId)
        {
            var feedback = await _feedbackRepo.GetQueryable()
                                              .FirstOrDefaultAsync(f => f.Id == feedbackId && !f.IsDeleted);
            if (feedback == null)
                return false;

            feedback.IsDeleted  = true;
            feedback.DeletedAt  = DateTime.UtcNow;

            _feedbackRepo.Update(feedback);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
