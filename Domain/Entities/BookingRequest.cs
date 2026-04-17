using Domain.ENUMs;
namespace Domain.Entities
{
    public class BookingRequest
    {
        public int RequestId{ get; set; }
        public RequestStatus Status{ get; set; }

        // Foreign keys
        public int OrganizerId { get; set; }
        public int EventId { get; set; }
        public int PlaceId { get; set; }

        // Navigation properties

        public Organizer Organizer { get; set; }
        // public Event Event { get; set; } // to be created
        public Place Place { get; set; }

    }
}