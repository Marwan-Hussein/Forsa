using Domain.Common.Implementation;
using Domain.Entities.OrganizerEntities;

namespace Domain.Entities
{
    public class PromoCode : BaseEntity
    {
        public string Code { get; set; }
        public decimal DiscountValue { get; set; }
        public bool IsPercentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime ExpiryDate { get; set; }

        public int MaxUsageLimit { get; set; }
        public int CurrentUsage { get; set; }

        public bool IsActive { get; set; }
        public bool IsExpired => DateTime.UtcNow > ExpiryDate;

        // Relationships
        public int OrganizerId { get; set; }
        public int EventId { get; set; }

        // Navigation Properties
        public Organizer Organizer { get; set; }
        
        // public Event Event { get; set; }  // not created Event

    }
}
