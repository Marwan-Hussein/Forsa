using System;

namespace Application.Core.DTOs.Event
{
    public class UpdateEventDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? CustomLocation { get; set; }
        public double TicketPrice { get; set; }
        public int TotalTickets { get; set; }
    }
}
