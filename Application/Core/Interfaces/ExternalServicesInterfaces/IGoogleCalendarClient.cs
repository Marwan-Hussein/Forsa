using Application.Core.DTOs.ExternalDTOs;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    public interface IGoogleCalendarClient
    {
        string CreateAuthorizationUrl(string redirectUri, string state);
        Task<GoogleAuthTokenDto> ExchangeCodeForTokenAsync(string code, string redirectUri, CancellationToken cancellationToken = default);
        Task<GoogleAuthTokenDto> RefreshTokenAsync(GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default);
        Task<GoogleUserInfoDto> GetUserInfoAsync(GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default);
        Task<string> CreateEventAsync(string calendarId, GoogleCalendarEventDto eventDto, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default);
        Task UpdateEventAsync(string calendarId, string googleEventId, GoogleCalendarEventDto eventDto, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default);
        Task DeleteEventAsync(string calendarId, string googleEventId, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default);
        Task<GoogleCalendarEventDto?> GetEventAsync(string calendarId, string googleEventId, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default);
    }
}
