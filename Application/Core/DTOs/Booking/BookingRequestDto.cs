namespace Application.Core.DTOs.Booking
{
    public class BookingRequestDto
    {
        public int OrganizerId { get; set; }
        public DateTime RequestedDate { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
