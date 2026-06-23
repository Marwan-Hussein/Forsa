using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Event
{
    public class OrganizerPromoCodeDto
    {
        public string Code { get; set; }
        public decimal DiscountValue { get; set; }
        public bool IsPercentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int MaxUsageLimit { get; set; }
    }
}
