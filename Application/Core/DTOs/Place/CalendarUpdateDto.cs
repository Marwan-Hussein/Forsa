namespace Application.Core.DTOs.Place
{
    public class CalendarUpdateDto
    {
        public DateTime Date { get; set; }
        public TimeSpan? StartTime { get; set; }   // null = full day
        public TimeSpan? EndTime { get; set; }     // null = full day
        public int Status { get; set; }            // PlaceStatus enum value (4=Available, 6=Blocked)
    }
}
