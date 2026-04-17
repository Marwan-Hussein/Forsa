namespace Domain.Entities.EventEntities
{
    public class EventMedia
    {
        public int EventMediaId { get; set; }
        public string MediaUrl { get; set; }
        public string MediaType { get; set; }

        // FK to Event
        public int EventId { get; set; }
        public Event Event { get; set; }
    }
}