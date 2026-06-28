using Domain.Entities.BookingEntities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(ForsaDbContext context) : base(context){}

        public async Task<Booking> GetBookingWithEventAsync(int bookingId)
        {
            var suspectBooking = _context.Set<Booking>()
                                         .Include(b => b.Event)
                                         .Where(b => b.Id == bookingId)
                                         .FirstOrDefault();
            if (suspectBooking == null)
            {
                throw new Exception($"Booking with ID {bookingId} not found.");
            }

            return suspectBooking;
        }
    }
}
