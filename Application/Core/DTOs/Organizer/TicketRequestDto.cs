namespace Application.Core.DTOs.Organizer
{
    public class TicketRequestDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public int AttendeeId { get; set; }
        public string AttendeeName { get; set; }
        public string AttendeeEmail { get; set; }
        public string AttendeePhone { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; }
        public int Tickets { get; set; }
        public string? SpecialRequests { get; set; }
        public string? RejectionReason { get; set; }
    }
}
