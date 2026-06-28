namespace Application.Core.DTOs.Owner
{
    public class OwnerDashboardDto
    {
        public int TotalPlaces { get; set; }
        public int ActivePlaces { get; set; }
        public int PendingPlaces { get; set; }
        
        public int TotalBookingRequests { get; set; }
        public int PendingRequests { get; set; }
        public int ConfirmedRequests { get; set; }
        
        public decimal TotalEarnings { get; set; }
        public double AverageRating { get; set; }
    }
}
