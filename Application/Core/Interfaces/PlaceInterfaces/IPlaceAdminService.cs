using Application.Core.DTOs.Place;
using Application.Core.DTOs.Admin;
using Domain.ENUMs;

namespace Application.Core.Interfaces.PlaceInterfaces
{
    public interface IPlaceAdminService
    {
        Task<List<PlaceDetailsDto>> GetAllPlacesAsync(PlaceSearchParameterDto parameters);
        Task<List<PlaceDetailsDto>> GetPendingPlacesAsync(PlaceSearchParameterDto parameters);
        Task<bool> UpdateStatusAsync(int placeId, PlaceStatus status, string? reason);
        Task<bool> SoftDeletePlaceAsync(int placeId);
        Task<List<AdminReviewDto>> GetAllFeedbacksAsync(string? targetType = null);
        Task<bool> SoftDeleteFeedbackAsync(int feedbackId);
    }
}
