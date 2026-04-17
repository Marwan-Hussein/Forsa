using Domain.Entities.AttendeeEntities;
using Domain.Entities.BookingEntities;

namespace Domain.Entities.OrganizerEntities
{
    public class Organizer : ApplicationUser
    {
        public string OrganizationName { get; set; }


        // Relationships
        public List <BookingRequest> BookingRequests { get; set; }
        public List <PromoCode> PromoCodes { get; set; }

        // Navigation properties
        public List<AttendeeSubsOrganizer> AttendeeSubsOrganizers { get; set; }
        public List<OrganiztionTypeWithOrganizer> OrganiztionTypeWithOrganizers { get; set; }
    }
}
