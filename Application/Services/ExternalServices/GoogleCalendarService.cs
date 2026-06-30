using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Core.Settings;
using Domain.Entities.AuthEntities;
using Domain.Interfaces;
using Google;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;

namespace Application.Services.ExternalServices
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        private readonly GoogleCalendarSettings _settings;
        private readonly ILogger<GoogleCalendarService> _logger;
        private readonly IGoogleCalendarClient _googleCalendarClient;
        private readonly IQueryableRepository<UserGoogleToken> _tokenRepository;
        private readonly IUnitOfWork _unitOfWork;

        public GoogleCalendarService(
            IOptions<GoogleCalendarSettings> settings,
            ILogger<GoogleCalendarService> logger,
            IGoogleCalendarClient googleCalendarClient,
            IQueryableRepository<UserGoogleToken> tokenRepository,
            IUnitOfWork unitOfWork)
        {
            _settings = settings.Value;
            _logger = logger;
            _googleCalendarClient = googleCalendarClient;
            _tokenRepository = tokenRepository;
            _unitOfWork = unitOfWork;
        }

        private async Task<GoogleAuthTokenDto> GetUserTokenAsync(string calendarId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(calendarId))
                throw new ArgumentException("Calendar ID (email) cannot be null or empty.", nameof(calendarId));

            var tokenEntity = await _tokenRepository.GetQueryable()
                .FirstOrDefaultAsync(t => t.GoogleEmail.ToLower() == calendarId.ToLower(), cancellationToken);

            if (tokenEntity == null)
            {
                throw new UnauthorizedAccessException($"No Google Calendar connection found for email '{calendarId}'. Please connect Google Calendar first.");
            }

            var tokenDto = new GoogleAuthTokenDto
            {
                AccessToken = tokenEntity.AccessToken,
                RefreshToken = tokenEntity.RefreshToken,
                ExpiresAtUtc = tokenEntity.TokenExpiration,
                IssuedUtc = tokenEntity.TokenExpiration.AddSeconds(-3600) // best-effort
            };

            // If token is expired or close to expiration (within 2 minutes), refresh it
            if (tokenDto.ExpiresAtUtc <= DateTime.UtcNow.AddMinutes(2))
            {
                _logger.LogInformation("Google token for user {CalendarId} is expired or close to expiration. Attempting to refresh...", calendarId);

                if (string.IsNullOrWhiteSpace(tokenDto.RefreshToken))
                {
                    throw new UnauthorizedAccessException($"Google Calendar token for '{calendarId}' has expired and no refresh token is available. Please reconnect your account.");
                }

                try
                {
                    var refreshedToken = await _googleCalendarClient.RefreshTokenAsync(tokenDto, cancellationToken);

                    tokenEntity.AccessToken = refreshedToken.AccessToken;
                    if (!string.IsNullOrWhiteSpace(refreshedToken.RefreshToken))
                    {
                        tokenEntity.RefreshToken = refreshedToken.RefreshToken;
                    }
                    tokenEntity.TokenExpiration = refreshedToken.ExpiresAtUtc;

                    _tokenRepository.Update(tokenEntity);
                    await _unitOfWork.SaveChangesAsync();

                    tokenDto = refreshedToken;
                    _logger.LogInformation("Google token for user {CalendarId} refreshed successfully.", calendarId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to refresh Google token for user {CalendarId}.", calendarId);
                    throw new UnauthorizedAccessException($"Failed to refresh Google Calendar connection for '{calendarId}'. Please reconnect your account.", ex);
                }
            }

            return tokenDto;
        }

        public async Task<string> CreateEventAsync(string calendarId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var tokenDto = await GetUserTokenAsync(calendarId, cancellationToken);
                return await _googleCalendarClient.CreateEventAsync(calendarId, eventDto, tokenDto, cancellationToken);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Conflict)
            {
                _logger.LogWarning(ex, "Conflict when creating Google Calendar event: {Title}", eventDto.Title);
                throw new InvalidOperationException($"A conflicting event already exists for '{eventDto.Title}'.", ex);
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex, "Google Calendar API error while creating event: {Title}. Status: {StatusCode}", eventDto.Title, ex.HttpStatusCode);
                throw new ExternalServiceException($"Failed to create Google Calendar event '{eventDto.Title}'.\n {ex.Message}", ex);
            }
            catch (Exception ex) when (ex is not (InvalidOperationException or UnauthorizedAccessException or ExternalServiceException))
            {
                _logger.LogError(ex, "Unexpected error creating Google Calendar event: {Title}", eventDto.Title);
                throw new ExternalServiceException($"Unexpected error creating Google Calendar event '{eventDto.Title}'.", ex);
            }
        }

        public async Task UpdateEventAsync(string calendarId, string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var tokenDto = await GetUserTokenAsync(calendarId, cancellationToken);
                await _googleCalendarClient.UpdateEventAsync(calendarId, googleEventId, eventDto, tokenDto, cancellationToken);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogWarning(ex, "Google Calendar event not found for update: {EventId}", googleEventId);
                throw new KeyNotFoundException($"Google Calendar event '{googleEventId}' was not found.", ex);
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex, "Google Calendar API error while updating event: {EventId}. Status: {StatusCode}", googleEventId, ex.HttpStatusCode);
                throw new ExternalServiceException($"Failed to update Google Calendar event '{googleEventId}'.\n {ex.Message}", ex);
            }
            catch (Exception ex) when (ex is not (KeyNotFoundException or UnauthorizedAccessException or ExternalServiceException))
            {
                _logger.LogError(ex, "Unexpected error updating Google Calendar event: {EventId}", googleEventId);
                throw new ExternalServiceException($"Unexpected error updating Google Calendar event '{googleEventId}'.", ex);
            }
        }

        public async Task DeleteEventAsync(string calendarId, string googleEventId, CancellationToken cancellationToken = default)
        {
            try
            {
                var tokenDto = await GetUserTokenAsync(calendarId, cancellationToken);
                await _googleCalendarClient.DeleteEventAsync(calendarId, googleEventId, tokenDto, cancellationToken);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound || ex.HttpStatusCode == HttpStatusCode.Gone)
            {
                _logger.LogWarning(ex, "Google Calendar event {EventId} was not found or already deleted.", googleEventId);
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex, "Google Calendar API error while deleting event: {EventId}. Status: {StatusCode}", googleEventId, ex.HttpStatusCode);
                throw new ExternalServiceException($"Failed to delete Google Calendar event '{googleEventId}'.\n {ex.Message}", ex);
            }
            catch (Exception ex) when (ex is not (UnauthorizedAccessException or ExternalServiceException))
            {
                _logger.LogError(ex, "Unexpected error deleting Google Calendar event: {EventId}", googleEventId);
                throw new ExternalServiceException($"Unexpected error deleting Google Calendar event '{googleEventId}'.", ex);
            }
        }

        public async Task<GoogleCalendarEventDto?> GetEventAsync(string calendarId, string googleEventId, CancellationToken cancellationToken = default)
        {
            try
            {
                var tokenDto = await GetUserTokenAsync(calendarId, cancellationToken);
                return await _googleCalendarClient.GetEventAsync(calendarId, googleEventId, tokenDto, cancellationToken);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Google Calendar event not found: {EventId}", googleEventId);
                return null;
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex, "Google Calendar API error while retrieving event: {EventId}. Status: {StatusCode}", googleEventId, ex.HttpStatusCode);
                throw new ExternalServiceException($"Failed to retrieve Google Calendar event '{googleEventId}'.\n {ex.Message}", ex);
            }
            catch (Exception ex) when (ex is not (UnauthorizedAccessException or ExternalServiceException))
            {
                _logger.LogError(ex, "Unexpected error retrieving Google Calendar event: {EventId}", googleEventId);
                throw new ExternalServiceException($"Unexpected error retrieving Google Calendar event '{googleEventId}'.", ex);
            }
        }
    }

    public class ExternalServiceException : Exception
    {
        public ExternalServiceException(string message) : base(message) { }
        public ExternalServiceException(string message, Exception innerException) : base(message, innerException) { }
    }
}
