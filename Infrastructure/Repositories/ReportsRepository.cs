using Application.Core.DTOs.Admin;
using Application.Core.Interfaces;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.Entities;
using Domain.ENUMs;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ReportsRepository : IReportsRepository
    {
        private readonly ForsaDbContext _context;

        public ReportsRepository(ForsaDbContext context)
        {
            _context = context;
        }

        public async Task<PerformanceReportDTO> GetPerformanceReportAsync(DateTime from, DateTime to)
        {
            // all are within the date range and not deleted (from to)
           
            // CompletedTasks: Completed Events + Confirmed Bookings
            var completedEventsCount = await _context.Set<Event>()
                .CountAsync(
                    e => !e.IsDeleted 
                    && e.Status == EventStatus.Completed 
                    && e.EndDate >= from
                    && e.EndDate <= to
                    );

            var confirmedBookingsCount = await _context.Set<Booking>()
                .CountAsync(
                    b => !b.IsDeleted 
                    && b.Status == BookingStatus.Confirmed 
                    && b.BookingDate >= from 
                    && b.BookingDate <= to
                    );

            // AverageRatings: Average rating of Feedbacks
            var averageRating = await _context.Set<Feedback>()
                .Where(
                    f => !f.IsDeleted 
                    && f.CreatedAt >= from 
                    && f.CreatedAt <= to
                    )
                .Select(f => (double?)f.Rating)
                .AverageAsync() ?? 0.0;

            // TotalEarnings: Sum of (Tickets * Price) for confirmed bookings
            var totalEarnings = await _context.Set<Booking>()
                .Where(
                    b => !b.IsDeleted 
                    && b.Status == BookingStatus.Confirmed 
                    && b.BookingDate >= from 
                    && b.BookingDate <= to
                    )
                .SumAsync(b => (decimal)(b.NumberOfTickets * b.Event.TicketPrice));

            return new PerformanceReportDTO
            {
                CompletedTasks = completedEventsCount + confirmedBookingsCount,
                AverageRatings = averageRating,
                TotalEarnings = totalEarnings
            };
        }
    }
}
