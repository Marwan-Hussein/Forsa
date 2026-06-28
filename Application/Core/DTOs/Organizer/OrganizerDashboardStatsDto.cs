namespace Application.Core.DTOs.Organizer
{
    public class OrganizerDashboardStatsDto
    {
        public int TotalEvents { get; set; }
        public int CompletedEvents { get; set; }
        public int PendingEvents { get; set; }
        public int TotalTicketsSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalPlacesBooked { get; set; }
    }
}
