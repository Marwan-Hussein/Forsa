using Domain.Common.Implementation;
using Domain.ENUMs; // Added to reference enums

namespace Domain.Entities
{
    public class Notification : BaseEntity
    {
        public string Message { get; set; }

        public NotificationType Type { get; set; }
        public DeliveryMethod SentVia { get; set; }
        public NotificationStatus Status { get; set; }
        public int? UserId { get; set; }
        public ApplicationUser User { get; set; }

    }
}

