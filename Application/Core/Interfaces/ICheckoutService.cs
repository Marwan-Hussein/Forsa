using Application.Core.DTOs.Payment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces
{
    public interface ICheckoutService
    {
        Task<PaymentResponseDto> ProcessEventCheckoutAsync(int bookingId, int userId);
    }
}
