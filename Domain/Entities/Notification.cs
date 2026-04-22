using Domain.Common.Implementation;

namespace Domain.Entities
{
    public class Notification : BaseEntity
    {
        public int NotificationId { get; set; }
        public string Message { get; set; }

        public string Type { get; set; }
        public string SentVia { get; set; }
        public string Status { get; set; }
        public int? UserId { get; set; }
        public ApplicationUser User { get; set; }

    }
}

