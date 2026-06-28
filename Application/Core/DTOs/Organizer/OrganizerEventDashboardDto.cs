namespace Application.Core.DTOs.Organizer
{
    public class OrganizerEventDashboardDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public int TotalTickets { get; set; }
        public int RemainingTickets { get; set; }
        public int BookedTickets => TotalTickets - RemainingTickets;
        public double OccupancyPercentage => TotalTickets > 0
            ? Math.Round((double)BookedTickets / TotalTickets * 100, 1) : 0;
    }
}
