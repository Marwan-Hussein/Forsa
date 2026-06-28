using Application.Core.DTOs.ExternalDTOs;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    public interface IGoogleCalendarService
    {
        // creates a new event in google calendar
        // returns the eventID of the created event
        Task<string> CreateEventAsync(GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default);
        Task UpdateEventAsync(string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default);

        Task DeleteEventAsync(string googleEventId, CancellationToken cancellationToken = default);

        // retrieves an event from Google Calendar by its ID
        // returns the CalendarEventDTO obj or null if not existed
        Task<GoogleCalendarEventDto?> GetEventAsync(string googleEventId, CancellationToken cancellationToken = default);
    }
}
