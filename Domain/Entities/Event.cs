using Domain.ENUMs;

namespace Domain.Entities
{
    public class Event
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public double TicketPrice { get; set; }
        public int TotalTickets { get; set; }
        public int RemainingTickets { get; set; }
        public EventStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // FK
        //public int OrganizerId { get; set; }
        //public Organizer Organizer { get; set; }

        // FK 
        public int PlaceId { get; set; }
        public string Place { get; set; } // this will be changed to Place object in the future (when we implement the Place entity)

        // Navigation - owned by Person 3
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<EventMedia> EventMedias { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
        public ICollection<WishListItem> WishListItems { get; set; }
    }
}