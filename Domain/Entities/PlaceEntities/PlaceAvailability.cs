using Domain.Common.Implementation;
using Domain.ENUMs;

namespace Domain.Entities.PlaceEntities
{
    public class PlaceAvailability : BaseEntity
    {
        public DateTime Date { get; set; }
        public TimeSpan? StartTime { get; set; }    // null = full day
        public TimeSpan? EndTime { get; set; }      // null = full day
        public PlaceStatus Status { get; set; }
        public string? GoogleCalendarEventId { get; set; } // The ID of the synced Google Calendar event (null if not synced)

        // FK (Place)
        public int PlaceId { get; set; }
        public Place Place { get; set; }
    }
}
