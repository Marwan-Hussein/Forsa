using Application.Core.DTOs.Place;

namespace Application.Core.Interfaces.PlaceInterfaces
{
    public interface IPlaceMediaService
    {
        Task<List<PlaceMediaDto>> UploadPlaceMediaAsync(int ownerId, int placeId, List<MediaUploadDto> mediaFiles);
        Task<bool> DeletePlaceMediaAsync(int ownerId, int placeId, int mediaId);
        Task<List<PlaceMediaDto>> GetPlaceMediaAsync(int placeId);
    }
}
