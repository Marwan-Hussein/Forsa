using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities.OrganizerEntities
{
    public class OrganiztionTypeWithOrganizer
    {
        public int Id { get; set; }

        // FKs
        public int OrganizerId { get; set; }
        public int OrganizationTypeId { get; set; }

        // Navigation properties
        public Organizer Organizer { get; set; }
        public OrganizationType OrganizationType { get; set; }
    }
}