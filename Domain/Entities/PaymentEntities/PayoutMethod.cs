using Domain.Common.Implementation;
using Domain.ENUMs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities.PaymentEntities
{
    public class PayoutMethod : BaseEntity
    {
        public int PayoutMethodId { get; set; }

        public PayoutType Type { get; set; }

        public string AccountNumber { get; set; } = string.Empty;

        public string AccountHolderName { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = true;

        public int UserId { get; set; }
        public ApplicationUser ApplicationUser { get; set; }
    }
}
