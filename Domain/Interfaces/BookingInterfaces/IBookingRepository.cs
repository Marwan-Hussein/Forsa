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
        //Task<Booking> GetBookingByIdAsync(int bookingId);
        Task<List<Booking>> GetBookingsByUserIdAsync(string userId);
        //Task<List<Booking>> GetBookingsByEventIdAsync(int eventId);
        //Task<List<Booking>> GetBookingsByStatusAsync(BookingStatus status);
    }
}
