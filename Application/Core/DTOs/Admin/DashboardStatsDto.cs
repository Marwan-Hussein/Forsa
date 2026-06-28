namespace Application.Core.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalAttendees { get; set; }
        public int TotalOrganizers { get; set; }
        public int TotalOwners { get; set; }
        
        public int TotalPlaces { get; set; }
        public int PendingPlaces { get; set; }
        
        public int TotalEvents { get; set; }
        public int PendingEvents { get; set; }
        public int CompletedEvents { get; set; }
        
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        
        public decimal TotalEarnings { get; set; }
        public int TotalBookings { get; set; }
    }
}
