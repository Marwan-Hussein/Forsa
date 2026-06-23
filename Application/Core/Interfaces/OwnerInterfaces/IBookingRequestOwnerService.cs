using Application.Core.DTOs.Booking;

namespace Application.Core.Interfaces.OwnerInterfaces
{
    public interface IBookingRequestOwnerService
    {
        Task<List<BookingRequestDetailsDto>> GetOwnerBookingRequestsAsync(int ownerId);
        Task<BookingRequestDetailsDto> ProcessOrganizerBookingRequestAsync(int ownerId, int requestId, ProcessBookingRequestDto dto);
    }
}
