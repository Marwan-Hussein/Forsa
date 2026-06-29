namespace Application.Core.DTOs.ExternalDTOs
{
    public class GoogleCalendarEventDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Location { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? TimeZone { get; set; }
    }
}
