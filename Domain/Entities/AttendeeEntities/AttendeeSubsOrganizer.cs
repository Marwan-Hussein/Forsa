using Domain.Entities.OrganizerEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities.AttendeeEntities
{
    public class AttendeeSubsOrganizer
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
