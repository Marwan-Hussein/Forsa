using Application.Core.DTOs.Place;
using Domain.ENUMs;

namespace Application.Core.Interfaces.PlaceInterfaces
{
    public interface IPlaceAdminService
    {
        Task<List<PlaceDetailsDto>> GetPendingPlacesAsync(PlaceSearchParameterDto parameters);
        Task<bool> UpdateStatusAsync(int placeId, PlaceStatus status, string? reason);
        Task<bool> SoftDeleteFeedbackAsync(int feedbackId);
    }
}
