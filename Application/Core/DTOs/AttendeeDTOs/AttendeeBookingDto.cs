namespace Application.Core.DTOs.AttendeeDTOs
{
    public class AttendeeBookingDto
    {
        public int BookingId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public string EventCategory { get; set; }
        public DateTime EventStartDate { get; set; }
        public DateTime EventEndDate { get; set; }
        public string? EventPlace { get; set; }
        public int NumberOfTickets { get; set; }
        public string Status { get; set; }
        public DateTime BookingDate { get; set; }
        public string EventStatus { get; set; }
        public bool HasSubmittedFeedback { get; set; }
    }
}
