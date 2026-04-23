namespace Application.Core.DTOs.Event
{
    public class EventDetailsDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public double TicketPrice { get; set; }
        public int TotalTickets { get; set; }
        public int RemainingTickets { get; set; }
        public string Status { get; set; }  // Enum EventStatus
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Place { get; set; }
        public string AvailabilityStatus { get; set; }  // Calculated based on remaining tickets
    }
}
