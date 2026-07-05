using Application.Core.DTOs.Admin;
using Application.Core.Interfaces.AdminInterfaces;
using Domain.Entities;
using Domain.Entities.BookingEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Domain.Interfaces.BookingInterfaces;
using Microsoft.AspNetCore.Identity;

using Microsoft.EntityFrameworkCore;
using Domain.Entities.PaymentEntities;

namespace Application.Services.AdminServices
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IPlaceRepository _placeRepo;
        private readonly IEventRepository _eventRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IBookingRepository _bookingRepo;
        private readonly IQueryableRepository<PaymentTransaction> _transactionRepo;

        public AdminDashboardService(
            UserManager<ApplicationUser> userManager,
            IPlaceRepository placeRepo,
            IEventRepository eventRepo,
            IFeedbackRepository feedbackRepo,
            IBookingRepository bookingRepo,
            IQueryableRepository<PaymentTransaction> transactionRepo)
        {
            _userManager = userManager;
            _placeRepo = placeRepo;
            _eventRepo = eventRepo;
            _feedbackRepo = feedbackRepo;
            _bookingRepo = bookingRepo;
            _transactionRepo = transactionRepo;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            // Users
            var users = _userManager.Users.Where(u => !u.IsDeleted).ToList();
            var roles = new Dictionary<int, string>();
            foreach (var user in users)
            {
                var userRoles = await _userManager.GetRolesAsync(user);
                roles[user.Id] = userRoles.FirstOrDefault() ?? "Unknown";
            }

            var totalAttendees = roles.Values.Count(r => r.Equals("Attendee", StringComparison.OrdinalIgnoreCase));
            var totalOrganizers = roles.Values.Count(r => r.Equals("Organizer", StringComparison.OrdinalIgnoreCase));
            var totalOwners = roles.Values.Count(r => r.Equals("Owner", StringComparison.OrdinalIgnoreCase));

            // Places
            var places = await _placeRepo.GetAllAsync();
            var totalPlaces = places.Count(p => !p.IsDeleted);
            var pendingPlaces = places.Count(p => p.Status == PlaceStatus.Pending && !p.IsDeleted);

            // Events
            var events = await _eventRepo.GetAllAsync();
            var totalEvents = events.Count(e => !e.IsDeleted);
            var pendingEvents = events.Count(e => e.Status == EventStatus.Pending && !e.IsDeleted);
            var completedEvents = events.Count(e => e.Status == EventStatus.Completed && !e.IsDeleted);

            // Reviews
            var feedbacks = await _feedbackRepo.GetAllAsync();
            var totalReviews = feedbacks.Count(f => !f.IsDeleted);
            var activeFeedbacks = feedbacks.Where(f => !f.IsDeleted && f.Rating > 0).ToList();
            var avgRating = activeFeedbacks.Count > 0
                ? activeFeedbacks.Average(f => (double)f.Rating)
                : 0.0;

            // Bookings
            var bookings = await _bookingRepo.GetAllAsync();
            var confirmedBookings = bookings.Where(b => !b.IsDeleted && b.Status == BookingStatus.Confirmed).ToList();
            var totalBookings = confirmedBookings.Count;

            return new DashboardStatsDto
            {
                TotalUsers = users.Count,
                TotalAttendees = totalAttendees,
                TotalOrganizers = totalOrganizers,
                TotalOwners = totalOwners,
                TotalPlaces = totalPlaces,
                PendingPlaces = pendingPlaces,
                TotalEvents = totalEvents,
                PendingEvents = pendingEvents,
                CompletedEvents = completedEvents,
                TotalReviews = totalReviews,
                AverageRating = Math.Round(avgRating, 1),
                TotalEarnings = await _transactionRepo.GetQueryable()
                    .Where(t => t.TransactionStatus == TransactionStatus.Completed)
                    .SumAsync(t => t.Amount),
                TotalBookings = totalBookings
            };
        }
    }
}
