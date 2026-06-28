using Domain.Entities.BookingEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IBookingRepository
    {
        Task<Booking> GetBookingWithEventAsync(int bookingId);
    }
}
