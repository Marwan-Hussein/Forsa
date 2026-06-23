using Application.Core.DTOs.Place;

namespace Application.Core.Interfaces.OwnerInterfaces
{
    public interface IPlaceOwnerService
    {
        // Place CRUD
        Task<PlaceDetailsDto> AddNewPlaceAsync(int ownerId, AddPlaceDto dto);
        Task<PlaceDetailsDto> UpdatePlaceAsync(int ownerId, int placeId, UpdatePlaceDto dto);
        Task<bool> DeletePlaceAsync(int ownerId, int placeId);
        Task<List<PlaceDetailsDto>> GetOwnerPlacesAsync(int ownerId);
        Task<PlaceDetailsDto?> GetOwnerPlaceByIdAsync(int ownerId, int placeId);
    }
}
