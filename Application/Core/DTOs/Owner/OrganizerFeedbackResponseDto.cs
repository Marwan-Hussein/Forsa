namespace Application.Core.DTOs.Owner
{
    public class OrganizerFeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public int BookingRequestId { get; set; }
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
