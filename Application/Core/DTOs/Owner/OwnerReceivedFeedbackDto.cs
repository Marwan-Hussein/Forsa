using System;

namespace Application.Core.DTOs.Owner
{
    public class OwnerReceivedFeedbackDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public string OrganizerName { get; set; }
        public string PlaceName { get; set; }
        public int PlaceId { get; set; }
        public string EventTitle { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
