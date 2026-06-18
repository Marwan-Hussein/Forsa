namespace Application.Core.DTOs.Place
{
    public class PlaceAvailabilityDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string Status { get; set; }
        public int PlaceId { get; set; }
    }
}
