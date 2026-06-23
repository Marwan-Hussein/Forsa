using Domain.Common.Implementation;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;
using Domain.Entities.PlaceEntities;

namespace Domain.Entities
{
    public class Feedback : BaseEntity
    {
        public int Rating { get; set; }
        public string Comment { get; set; }

        // FK (Attendee) 
        public int? AttendeeId { get; set; }
        public Attendee? Attendee { get; set; }

        // FK (Owner) 
        public int? OwnerId { get; set; }
        public Owner? Owner { get; set; }

        // FK (Organizer)
        public int? OrganizerId { get; set; }
        public Organizer? Organizer { get; set; }

        // FK (BookingRequest) to link feedback to a specific venue booking
        public int? BookingRequestId { get; set; }
        public BookingRequest? BookingRequest { get; set; }

        // FK (Event)
        public int? EventId { get; set; }
        public Event? Event { get; set; }

        // FK (Place)
        public int? PlaceId { get; set; }
        public Place? Place { get; set; }
    }
}