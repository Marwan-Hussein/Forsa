using Domain.Entities.BookingEntities;
using Domain.ENUMs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.BookingInterfaces
{
    public interface IBookingRepository : IQueryableRepository<Booking>
    {
        Task<List<Booking>> GetBookingsByUserIdAsync(string userId);
        Task<Booking> GetBookingWithEventAsync(int bookingId);
    }
}
