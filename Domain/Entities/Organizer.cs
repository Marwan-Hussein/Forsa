namespace Domain.Entities
{
    public class Organizer : ApplicationUser
    {
        public string OrganizationName { get; set; }


        // Relationships
        public List <BookingRequest> BookingRequests { get; set; }
        public List <OrganizationType> OraganizationTypes { get; set; }
        public List <PromoCode> PromoCodes { get; set; }
    }
}
