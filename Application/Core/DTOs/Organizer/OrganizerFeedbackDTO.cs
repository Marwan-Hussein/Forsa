using System;

namespace Application.Core.DTOs.Organizer
{
    public class OrganizerFeedbackDTO
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public string AttendeeName { get; set; }
        public int AttendeeId { get; set; }
        public string AttendeeImageUrl { get; set; }
        public string EventTitle { get; set; }
        public int EventId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
