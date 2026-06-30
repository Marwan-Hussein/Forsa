using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.Entities.PaymentEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Domain.Interfaces.BookingInterfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Application.Services
{
    public class CheckoutService(IBookingRepository bookingRepository 
                                ,IPaymentService paymentService
                                ,IQueryableRepository<PaymentTransaction> transactionRepo
                                ,IUnitOfWork unitOfWork) : ICheckoutService
    {
        public async Task<PaymentResponseDto> ProcessEventCheckoutAsync(int bookingId, int userId)
        {
            var booking = await bookingRepository.GetBookingWithEventAsync(bookingId);

            if (booking == null)
                throw new Exception("Booking not found");

            if (booking.Status is BookingStatus.Cancelled)
                throw new InvalidOperationException("Booking is cancelled");

            // If the event is free, it doesn't need checkout/payment
            if (booking.Event.TicketPrice <= 0)
                throw new InvalidOperationException("This booking is for a free event and is already confirmed.");

            // Check if there is already a completed transaction for this booking
            var isAlreadyPaid = await transactionRepo.GetQueryable()
                .AnyAsync(t => t.ReferenceId == bookingId && t.ItemType == "EventBooking" && t.TransactionStatus == TransactionStatus.Completed);

            if (isAlreadyPaid)
                throw new InvalidOperationException("Booking is already paid.");

            var amount = booking.Event.TicketPrice * booking.NumberOfTickets;

            // Check if a pending transaction already exists for this booking to avoid duplicates
            var existingTransaction = await transactionRepo.GetQueryable()
                .FirstOrDefaultAsync(t => t.ReferenceId == bookingId && t.ItemType == "EventBooking" && t.TransactionStatus == TransactionStatus.Pending);

            if (existingTransaction != null)
            {
                existingTransaction.Amount = (decimal)amount;
                transactionRepo.Update(existingTransaction);
                await unitOfWork.SaveChangesAsync();
                return await paymentService.InitiatePaymentProcess(existingTransaction.PaymentId);
            }

            var transaction = new PaymentTransaction
            {
                Amount = (decimal)amount,
                Currency = "EGP",
                ItemType = "EventBooking",
                ReferenceId = bookingId,
                TransactionStatus = TransactionStatus.Pending,
                UserId = userId
            };

            await transactionRepo.AddAsync(transaction);
            await unitOfWork.SaveChangesAsync();
            return await paymentService.InitiatePaymentProcess(transaction.PaymentId);
        }
    }
}
