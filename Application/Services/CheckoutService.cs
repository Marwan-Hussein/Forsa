using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.Entities.PaymentEntities;
using Domain.Entities.BookingEntities;
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
                                ,IQueryableRepository<BookingRequest> bookingRequestRepo
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

        public async Task<PaymentResponseDto> ProcessPlaceCheckoutAsync(int bookingRequestId, int userId)
        {
            var bookingRequest = await bookingRequestRepo.GetQueryable()
                .Include(br => br.Place)
                .FirstOrDefaultAsync(br => br.Id == bookingRequestId && !br.IsDeleted);

            if (bookingRequest == null)
                throw new Exception("Place booking request not found.");

            // Verify that the user attempting checkout is the organizer who requested the booking
            if (bookingRequest.OrganizerId != userId)
                throw new UnauthorizedAccessException("You are not authorized to check out this booking request.");

            if (bookingRequest.Status == RequestStatus.Cancelled)
                throw new InvalidOperationException("This place booking request is cancelled.");

            if (bookingRequest.Status == RequestStatus.Rejected)
                throw new InvalidOperationException("This place booking request was rejected by the owner.");

            if (bookingRequest.Status == RequestStatus.Pending)
                throw new InvalidOperationException("This place booking request is still pending owner approval.");

            // Check if already paid
            var isAlreadyPaid = await transactionRepo.GetQueryable()
                .AnyAsync(t => t.ReferenceId == bookingRequestId && t.ItemType == "PlaceBooking" && t.TransactionStatus == TransactionStatus.Completed);

            if (isAlreadyPaid)
                throw new InvalidOperationException("This booking request is already paid.");

            // Calculate Price: hourly if start/end times exist, otherwise daily
            decimal amount = 0;
            if (bookingRequest.StartTime.HasValue && bookingRequest.EndTime.HasValue)
            {
                var hours = (decimal)(bookingRequest.EndTime.Value - bookingRequest.StartTime.Value).TotalHours;
                if (hours <= 0) hours = 1; // fallback
                amount = bookingRequest.Place.HourlyPrice * hours;
            }
            else
            {
                amount = bookingRequest.Place.DailyPrice;
            }

            // Check if a pending transaction already exists to avoid duplicates
            var existingTransaction = await transactionRepo.GetQueryable()
                .FirstOrDefaultAsync(t => t.ReferenceId == bookingRequestId && t.ItemType == "PlaceBooking" && t.TransactionStatus == TransactionStatus.Pending);

            if (existingTransaction != null)
            {
                existingTransaction.Amount = amount;
                transactionRepo.Update(existingTransaction);
                await unitOfWork.SaveChangesAsync();
                return await paymentService.InitiatePaymentProcess(existingTransaction.PaymentId);
            }

            var transaction = new PaymentTransaction
            {
                Amount = amount,
                Currency = "EGP",
                ItemType = "PlaceBooking",
                ReferenceId = bookingRequestId,
                TransactionStatus = TransactionStatus.Pending,
                UserId = userId
            };

            await transactionRepo.AddAsync(transaction);
            await unitOfWork.SaveChangesAsync();
            return await paymentService.InitiatePaymentProcess(transaction.PaymentId);
        }
    }
}
