using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class AttendeeAttendeeInterestes
    {
        public int AttendeeId { get; set; }
        public int AttendeeInterestId { get; set; }

        public Attendee Attendee{ get; set; }
        public AttendeeInterest AttendeeInterest{ get; set; }
    }
}
