using Application.Core.DTOs.Place;

namespace Application.Core.Interfaces.OwnerInterfaces
{
    public interface IPlaceAvailabilityService
    {
        // Availability Calendar
        Task<PlaceAvailabilityDto> UpdatePlaceAvailabilityCalendarAsync(int ownerId, int placeId, CalendarUpdateDto dto);
        Task<List<PlaceAvailabilityDto>> GetPlaceCalendarAsync(int ownerId, int placeId, DateTime? fromDate, DateTime? toDate);
        Task<bool> RemoveAvailabilitySlotAsync(int ownerId, int placeId, int slotId);
    }
}
