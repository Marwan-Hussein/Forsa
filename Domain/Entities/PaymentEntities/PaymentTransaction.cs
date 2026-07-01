using Domain.Common.Implementation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.ENUMs;

namespace Domain.Entities.PaymentEntities
{
    public class PaymentTransaction : BaseEntity
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";
        public string? PaymobIntentionId { get; set; }
        public string? PaymobTransactionId { get; set; }

        public string ItemType { get; set; }
        public int ReferenceId { get; set; }

        public TransactionStatus TransactionStatus { get; set; }
        // Navigation properties
        public ApplicationUser ApplicationUser { get; set; }
        // Foreign key
        public int UserId { get; set; }
    }
}
