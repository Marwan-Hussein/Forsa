using Domain.Common.Implementation;

namespace Domain.Entities.AttendeeEntities
{
    public class AttendeeInterest : BaseEntity
    {
        public int InterestId { get; set; }
        public string InterestName  { get; set; }

        // Navigation properties
        public List<AttendeeInterestesWithAttendee> AttendeeInterestes { get; set; }


    }
}
