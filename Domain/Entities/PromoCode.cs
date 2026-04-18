using Domain.Entities.OrganizerEntities;

namespace Domain.Entities
{
    public class PromoCode
    {
        public int CodeId { get; set; }
        public string Code { get; set; }
        public decimal DiscountValue { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int UsageLimit { get; set; }

        // Relationships
        public int OrganizerId { get; set; }
        public int EventId { get; set; }

        // Navigation Properties
        public Organizer Organizer { get; set; }
        
        // public Event Event { get; set; }  // not created Event

    }
}
