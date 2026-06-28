using Domain.Common.Implementation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities.PaymentEntities
{
    public class WalletBalance : BaseEntity
    {
        public int WalletId { get; set; }
        public decimal PendingBalance { get; set; }
        public decimal AvailableBalance { get; set; }
        public decimal TotalWithdrawn { get; set; }


        public int UserId { get; set; }
        public ApplicationUser ApplicationUser { get; set; }
    }
}
