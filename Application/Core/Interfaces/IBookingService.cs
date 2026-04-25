using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Event;

namespace Application.Core.Interfaces
{
    public interface IBookingService
    {
        Task<EventDetailsDto> GetEventDetailsAsync(int eventId);
        Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto);
        Task<BookingResponseDto> GetBookingAsync(int bookingId);
        Task CancelBookingAsync(int bookingId);
    }
}
