using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.Interfaces.BookingInterfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.BookingRepos
{
    public class BookingRepository : QueryableRepository<Booking>,IBookingRepository
    {
        public BookingRepository(ForsaDbContext context):base(context)
        {
            
        }
        public async Task<List<Booking>> GetBookingsByUserIdAsync(string userId)
        {
            var bookings = await _context.Set<Booking>()
                .Where(b => b.AttendeeId.ToString() == userId)
                .OrderByDescending(b => b.BookingDate)
                .Take(3).
                ToListAsync();

            if (bookings == null || !bookings.Any())
                throw new KeyNotFoundException($"No bookings found for user with ID '{userId}'.");
            return bookings;
        }
    }
}
