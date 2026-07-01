using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Payment
{
    public class PaymentRequestDto
    {
        public int bookingId { get; set; }
        public string? PromoCode { get; set; }
    }
}
