using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities.AttendeeEntities
{
    public class AttendeeInterest
    {
        public int InterestId { get; set; }
        public string InterestName  { get; set; }

        // Navigation properties
        public List<AttendeeAttendeeInterestes> AttendeeInterestes { get; set; }


    }
}
