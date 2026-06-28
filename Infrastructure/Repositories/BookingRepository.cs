using Domain.Entities.BookingEntities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;

namespace Infrastructure.Repositories
{
    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(ForsaDbContext context) : base(context) { }
    }
}
