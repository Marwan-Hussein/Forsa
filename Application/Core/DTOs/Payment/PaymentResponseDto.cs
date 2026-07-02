using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } 
        public string? ClientSecret { get; set; }
        public string? PublicKey { get; set; }
        public int? BookingId { get; set; }
    }
}
