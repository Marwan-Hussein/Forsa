using Application.Core.DTOs.AttendeeDTOs;

namespace Application.Core.Interfaces.AttendeeInterfaces
{
    public interface IAttendeeBookingService
    {
        /// <summary>
        /// Returns all bookings for this attendee (all statuses: Confirmed, Cancelled, Attended).
        /// </summary>
        Task<List<AttendeeBookingDto>> GetBookedEventsAsync(int attendeeId);

        /// <summary>
        /// Returns only bookings marked as Attended (verified via QR scan).
        /// </summary>
        Task<List<AttendeeBookingDto>> GetAttendedEventsAsync(int attendeeId);

        /// <summary>
        /// Returns a calendar view of all active bookings (Confirmed + Attended), grouped by date.
        /// </summary>
        Task<List<AttendeeCalendarDto>> GetCalendarAsync(int attendeeId, DateTime? from, DateTime? to);
    }
}
