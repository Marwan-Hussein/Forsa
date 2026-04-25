using Domain.Common.Implementation;

namespace Domain.Entities.EventEntities
{
    public class EventMedia : BaseEntity
    {
        public string MediaUrl { get; set; }
        public string MediaType { get; set; }

        // FK to Event
        public int? EventId { get; set; }
        public Event Event { get; set; }
    }
}