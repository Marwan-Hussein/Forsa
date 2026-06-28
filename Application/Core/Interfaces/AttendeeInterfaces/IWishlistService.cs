using Application.Core.DTOs.AttendeeDTOs;

namespace Application.Core.Interfaces.AttendeeInterfaces
{
    public interface IWishlistService
    {
        Task<List<WishlistEventDto>> GetWishlistAsync(int attendeeId);
        Task AddToWishlistAsync(int attendeeId, int eventId);
        Task RemoveFromWishlistAsync(int attendeeId, int eventId);
    }
}
