using Application.Core.DTOs.Owner;
using Application.Core.Interfaces.OwnerInterfaces;
using Domain.Entities.BookingEntities;
using Domain.Entities.PlaceEntities;
using Domain.Entities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

using Domain.Entities.PaymentEntities;

namespace Application.Services.OwnerServices
{
    public class OwnerDashboardService : IOwnerDashboardService
    {
        private readonly IPlaceRepository _placeRepo;
        private readonly IQueryableRepository<BookingRequest> _bookingRequestRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IQueryableRepository<PaymentTransaction> _transactionRepo;

        public OwnerDashboardService(
            IPlaceRepository placeRepo,
            IQueryableRepository<BookingRequest> bookingRequestRepo,
            IFeedbackRepository feedbackRepo,
            IQueryableRepository<PaymentTransaction> transactionRepo)
        {
            _placeRepo = placeRepo;
            _bookingRequestRepo = bookingRequestRepo;
            _feedbackRepo = feedbackRepo;
            _transactionRepo = transactionRepo;
        }

        public async Task<OwnerDashboardDto> GetOwnerDashboardStatsAsync(int ownerId)
        {
            // 1. Places stats
            var places = await _placeRepo.GetAllAsync();
            var ownerPlaces = places.Where(p => p.OwnerId == ownerId && !p.IsDeleted).ToList();
            var totalPlaces = ownerPlaces.Count;
            var activePlaces = ownerPlaces.Count(p => p.Status == PlaceStatus.Approved);
            var pendingPlaces = ownerPlaces.Count(p => p.Status == PlaceStatus.Pending);

            // 2. Booking Requests stats
            var bookingRequests = await _bookingRequestRepo.GetQueryable()
                .Include(br => br.Place)
                .Where(br => br.Place.OwnerId == ownerId && !br.IsDeleted)
                .ToListAsync();

            var totalRequests = bookingRequests.Count;
            var pendingRequests = bookingRequests.Count(r => r.Status == RequestStatus.Pending);
            var confirmedRequests = bookingRequests.Count(r => r.Status == RequestStatus.Accepted);

            // 3. Earnings Calculation (Based on completed PaymentTransactions for this owner's place booking requests)
            var ownerBookingRequestIds = bookingRequests.Select(br => br.Id).ToList();
            decimal totalEarnings = await _transactionRepo.GetQueryable()
                .Where(t => t.ItemType == "PlaceBooking" 
                            && ownerBookingRequestIds.Contains(t.ReferenceId) 
                            && t.TransactionStatus == TransactionStatus.Completed)
                .SumAsync(t => t.Amount);

            // 4. Rating Calculation
            var feedbacks = await _feedbackRepo.GetAllAsync();
            var ownerFeedbacks = feedbacks.Where(f => f.OwnerId == ownerId && !f.IsDeleted && f.Rating > 0).ToList();
            var averageRating = ownerFeedbacks.Any() 
                ? ownerFeedbacks.Average(f => (double)f.Rating) 
                : 0.0;

            return new OwnerDashboardDto
            {
                TotalPlaces = totalPlaces,
                ActivePlaces = activePlaces,
                PendingPlaces = pendingPlaces,
                TotalBookingRequests = totalRequests,
                PendingRequests = pendingRequests,
                ConfirmedRequests = confirmedRequests,
                TotalEarnings = totalEarnings,
                AverageRating = Math.Round(averageRating, 1)
            };
        }
    }
}
