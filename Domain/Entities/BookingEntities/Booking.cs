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
        public string? SpecialRequests { get; set; }
        public string? RejectionReason { get; set; }

        // FK (attendee)
        public int AttendeeId { get; set; }
        public Attendee Attendee { get; set; }

        // FK (Event)
        public int EventId { get; set; }
        public Event Event { get; set; }
    }
}