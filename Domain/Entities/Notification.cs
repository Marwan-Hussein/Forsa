using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public string Message { get; set; }

        public string Type { get; set; }
        public string SentVia { get; set; }
        public string Status { get; set; }
        [ForeignKey("User")]
        public int? UserId { get; set; }
        public User User { get; set; }

        public DateTime CreatedAt { get; set; } 
    }
}

