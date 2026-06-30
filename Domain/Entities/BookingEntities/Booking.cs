using Domain.Common.Implementation;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.EventEntities;
using Domain.ENUMs;

namespace Domain.Entities.BookingEntities
{
    public class Booking : BaseEntity
    {
        public int NumberOfTickets { get; set; }
        public DateTime BookingDate { get; set; }
        public BookingStatus Status { get; set; }
        public string QRCode { get; set; }
        public string? GoogleCalendarEventId { get; set; } // The ID of the synced Google Calendar event (null if not synced)

        // FK (attendee)
        public int AttendeeId { get; set; }
        public Attendee Attendee { get; set; }

        // FK (Event)
        public int EventId { get; set; }
        public Event Event { get; set; }
    }
}