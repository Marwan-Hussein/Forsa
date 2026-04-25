using Domain.Common.Implementation;

namespace Domain.Entities.AttendeeEntities
{
    public class AttendeeInterest : BaseEntity
    {
        public string InterestName  { get; set; }

        // Navigation properties
        public List<AttendeeInterestesWithAttendee> AttendeeInterestes { get; set; }


    }
}
