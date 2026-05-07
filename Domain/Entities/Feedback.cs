using Domain.Common.Implementation;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.EventEntities;
using Domain.Entities.PlaceEntities;

namespace Domain.Entities
{
    public class Feedback : BaseEntity
    {
        public int Rating { get; set; }
        public string Comment { get; set; }

        // FK (Attendee)
        public int AttendeeId { get; set; }
        public Attendee Attendee { get; set; }

        // FK (Event)
        public int? EventId { get; set; }
        public Event? Event { get; set; }

        // FK (Place)
        public int? PlaceId { get; set; }
        public Place? Place { get; set; }
    }
}