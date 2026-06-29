using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.Interfaces.BookingInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class CheckoutService(IBookingRepository bookingRepository ,IPaymentService paymentService) : ICheckoutService
    {
        public Task<PaymentResponseDto> ProcessEventCheckoutAsync(int bookingId, int userId)
        {
            var booking = bookingRepository.GetBookingWithEventAsync(bookingId);


            throw new NotImplementedException();
        }
    }
}
