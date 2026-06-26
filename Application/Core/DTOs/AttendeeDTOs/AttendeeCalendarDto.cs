namespace Application.Core.DTOs.AttendeeDTOs
{
    public class AttendeeCalendarDto
    {
        public DateTime Date { get; set; }
        public List<AttendeeCalendarEventDto> Events { get; set; } = new();
    }

    public class AttendeeCalendarEventDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string BookingStatus { get; set; }
    }
}
