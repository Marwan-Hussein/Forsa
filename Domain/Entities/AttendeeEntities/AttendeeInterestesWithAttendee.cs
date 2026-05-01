namespace Domain.Entities.AttendeeEntities
{
    public class AttendeeInterestesWithAttendee
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
