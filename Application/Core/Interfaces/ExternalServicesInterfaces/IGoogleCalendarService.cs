using Application.Core.DTOs.ExternalDTOs;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    public interface IGoogleCalendarService
    {
        // creates a new event in the user's google calendar (identified by calendarId = user email)
        // returns the eventID of the created event
        Task<string> CreateEventAsync(string calendarId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default);
        Task UpdateEventAsync(string calendarId, string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default);

        Task DeleteEventAsync(string calendarId, string googleEventId, CancellationToken cancellationToken = default);

        // retrieves an event from Google Calendar by its ID
        // returns the CalendarEventDTO obj or null if not existed
        Task<GoogleCalendarEventDto?> GetEventAsync(string calendarId, string googleEventId, CancellationToken cancellationToken = default);
    }
}
