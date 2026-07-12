using Domain.Common.Interfaces;
using Domain.Entities.OrganizerEntities;

namespace Domain.Entities.AttendeeEntities
{
    public class AttendeeSubsOrganizer : IEntity<int>
    {
        public int Id { get; set; }
        // Fks
        public int AttendeeId { get; set; }
        public int OrganizerId { get; set; }

        // Navigation properties
        public Attendee Attendee { get; set; }
        public  Organizer Organizer { get; set; }
    }
}
