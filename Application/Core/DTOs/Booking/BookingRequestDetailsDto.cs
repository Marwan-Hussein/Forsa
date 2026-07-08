namespace Application.Core.DTOs.Booking
{
    public class BookingRequestDetailsDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; }
        public DateTime RequestedDate { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }

        // Organizer info
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; }
        public string OrganizerEmail { get; set; }
        public string OrganizationName { get; set; }

        // Place info
        public int PlaceId { get; set; }
        public string PlaceName { get; set; }

        // Event info
        public int EventId { get; set; }
        public string? EventTitle { get; set; }
        public string? EventStatus { get; set; }
        public DateTime? EventEndDate { get; set; }
    }
}
