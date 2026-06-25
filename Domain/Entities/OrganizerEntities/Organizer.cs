using Domain.Entities.AttendeeEntities;
using Domain.Entities.BookingEntities;

namespace Domain.Entities.OrganizerEntities
{
    public class Organizer : ApplicationUser
    {
        public string OrganizationName { get; set; }
        public double AverageRating { get; set; } = 0.0;
        public int ReviewsCount { get; set; } = 0;


        // Relationships
        public List <BookingRequest> BookingRequests { get; set; }
        public List <PromoCode> PromoCodes { get; set; }

        // Navigation properties
        public List<AttendeeSubsOrganizer> AttendeeSubsOrganizers { get; set; }
        public List<OrganiztionTypeWithOrganizer> OrganiztionTypeWithOrganizers { get; set; }
    }
}
