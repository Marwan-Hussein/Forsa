namespace Domain.Entities
{
    public class Feedback
    {
        public int FeedbackId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }

        // FK (Attendee)
        public int AttendeeId { get; set; }
        public Attendee Attendee { get; set; }

        // we wanna add the organizer's feedback to the "place" entity as well

        // FK (Event)
        public int EventId { get; set; }
        public Event Event { get; set; }
    }
}