namespace Application.Core.DTOs.Admin
{
    public class AdminReviewDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        
        // Who gave the feedback? (Could be Attendee or Organizer or Owner)
        public string ReviewerName { get; set; }
        public string ReviewerType { get; set; } // "Attendee", "Organizer", "Owner"
        
        // What is the feedback for? (Could be Event, Place, Organizer, Owner)
        public string TargetName { get; set; }
        public string TargetType { get; set; } // "Event", "Place"
        
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
