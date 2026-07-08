using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Core.DTOs.Event;
using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Organizer;

namespace Application.Core.Interfaces.OrganizerInterfaces
{
    public interface IOrganizerService
    {
        Task<EventDetailsDto> CreateEventAsync(CreateEventDto dto);
        Task<EventDetailsDto> UpdateEventDetailsAsync(int eventId, UpdateEventDto dto);
        Task CancelEventAsync(int eventId);
        Task<BookingRequestDetailsDto> SubmitPlaceBookingRequestAsync(int eventId, int placeId, BookingRequestDto dto);
        Task CancelPendingBookingRequestAsync(int requestId);
        Task<List<BookingRequestDetailsDto>> GetOrganizerBookingRequestsAsync(int organizerId);
        Task<List<TicketRequestDto>> GetOrganizerTicketRequestsAsync(int organizerId);
        Task<List<OrganizerEventDashboardDto>> GetOrganizerEventsDashboardAsync(int organizerId);
        Task<OrganizerDashboardStatsDto> GetOrganizerDashboardStatsAsync(int organizerId);
        Task<List<EventAttendeeDto>> GetEventAttendeesAsync(int eventId);
        Task ManualCheckInAsync(int bookingId);
        Task UndoCheckInAsync(int bookingId);
        Task<OrganizerProfileDto> GetOrganizerProfileAsync(int organizerId);
        Task SubmitPlaceFeedbackAsync(int organizerId, int placeId, int eventId, OrganizerPlaceFeedbackDto dto);
        Task ReleaseBookingRequestVenueAsync(int requestId);
    }
}
