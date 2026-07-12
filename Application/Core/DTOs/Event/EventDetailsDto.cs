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
        public int? PlaceId { get; set; }
        public string? PlaceLocation { get; set; }
        public decimal? PlaceLatitude { get; set; }
        public decimal? PlaceLongitude { get; set; }
        public string? GooglePlaceId { get; set; }
        public string AvailabilityStatus { get; set; }  // Calculated based on remaining tickets
        public string? ImageUrl { get; set; }
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; }
        public int OrganizerFollowersCount { get; set; }
        public string? CustomLocation { get; set; }
    }
}
