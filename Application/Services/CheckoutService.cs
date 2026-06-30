using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.Entities.PaymentEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Domain.Interfaces.BookingInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class CheckoutService(IBookingRepository bookingRepository 
                                ,IPaymentService paymentService
                                ,IGenericRepository<PaymentTransaction> genericRepo
                                ,IUnitOfWork unitOfWork) : ICheckoutService
    {
        public async Task<PaymentResponseDto> ProcessEventCheckoutAsync(int bookingId, int userId)
        {
            var booking = await bookingRepository.GetBookingWithEventAsync(bookingId);

            if (booking == null)
                throw new Exception("Booking not found");

            if (booking.Status is BookingStatus.Cancelled)
                throw new InvalidOperationException("Booking is cancelled");

            if (booking.Status is BookingStatus.Confirmed)
                throw new InvalidOperationException("Booking is already paid.");

            var amount = booking.Event.TicketPrice * booking.NumberOfTickets;

            var transaction = new PaymentTransaction
            {
                Amount = (decimal)amount,
                Currency = "EGP",
                ItemType = "EventBooking",
                ReferenceId = bookingId,
                TransactionStatus = TransactionStatus.Pending,
                UserId = userId
            };

            await genericRepo.AddAsync(transaction);
            await unitOfWork.SaveChangesAsync();
            return await paymentService.InitiatePaymentProcess(transaction.PaymentId);
        }
    }
}
