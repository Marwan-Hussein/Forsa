using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities.AttendeeEntities
{
    public class AttendeeAttendeeInterestes
    {
        public int Id { get; set; }
        // FKs
        public int AttendeeId { get; set; }
        public int AttendeeInterestId { get; set; }

        // Navigation properties
        public Attendee Attendee{ get; set; }
        public AttendeeInterest AttendeeInterest{ get; set; }
    }
}
