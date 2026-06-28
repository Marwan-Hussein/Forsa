using Application.Core.DTOs.ExternalDTOs;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    public interface IGoogleCalendarService
    {
        Task<string> CreateEventAsync(string accessToken, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default);
        Task UpdateEventAsync(string accessToken, string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default);
        Task DeleteEventAsync(string accessToken, string googleEventId, CancellationToken cancellationToken = default);
        Task<GoogleCalendarEventDto?> GetEventAsync(string accessToken, string googleEventId, CancellationToken cancellationToken = default);
    }
}
