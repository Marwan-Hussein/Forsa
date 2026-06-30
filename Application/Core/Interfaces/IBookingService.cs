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
        Task ApproveBookingAsync(int bookingId);
        Task RejectBookingAsync(int bookingId, string reason);


        Task<byte[]> GetTicketFromQr(int bookingId);
        Task VerifyAttendanceViaQrCodeAsync(int eventId, string qrCode);
        Task BlockAttendeeFromEventAsync(int eventId, int attendeeId);
    }
}
