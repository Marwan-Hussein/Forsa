using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Core.DTOs.Event;
using Application.Core.DTOs.Booking;
namespace Application.Core.Interfaces.OrganizerInterfaces
{
    public interface IOrganizerService
    {
        Task<EventDetailsDto> CreateEventAsync(CreateEventDto dto);
        Task<EventDetailsDto> UpdateEventDetailsAsync(int eventId, UpdateEventDto dto);
        Task CancelEventAsync(int eventId);
        Task<BookingRequestDetailsDto> SubmitPlaceBookingRequestAsync(int eventId, int placeId, BookingRequestDto dto);
        Task CancelPendingBookingRequestAsync(int requestId);
    }
}
