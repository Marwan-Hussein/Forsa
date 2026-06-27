using Application.Core.DTOs.ExternalDTOs;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    public interface IGoogleCalendarService
    {
        Task<string> CreateEventAsync(GoogleCalendarEventDto eventDto, CancellationToken cancellationToken);
        Task UpdateEventAsync(string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken);
        Task DeleteEventAsync(string googleEventId, CancellationToken cancellationToken);
    }
}
