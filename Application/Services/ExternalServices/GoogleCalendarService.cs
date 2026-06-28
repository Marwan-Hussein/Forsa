using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Core.Settings;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Services.ExternalServices
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        #region Attributes and ctor
        private readonly GoogleCalendarSettings _settings;
        private readonly ILogger<GoogleCalendarService> _logger;

        public GoogleCalendarService(
            IOptions<GoogleCalendarSettings> settings,
            ILogger<GoogleCalendarService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }
        #endregion

        #region Helper Methods (privates)
        private CalendarService GetCalendarService(string accessToken)
        {
            try
            {
                var credential = GoogleCredential.FromAccessToken(accessToken);
                return new CalendarService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName = _settings.ApplicationName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Google Calendar service with access token");
                throw new InvalidOperationException(
                    "Unable to initialize Google Calendar service. Check user credentials.", ex);
            }
        }

        // application DTO -> Google Calendar API Event object
        private static Event MapToGoogleEvent(GoogleCalendarEventDto dto)
        {
            var timeZone = dto.TimeZone ?? "UTC";

            return new Event
            {
                Summary = dto.Title,
                Description = dto.Description,
                Location = dto.Location,
                Start = new EventDateTime
                {
                    DateTimeDateTimeOffset = new DateTimeOffset(dto.StartTime, TimeSpan.Zero),
                    TimeZone = timeZone
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset = new DateTimeOffset(dto.EndTime, TimeSpan.Zero),
                    TimeZone = timeZone
                }
            };
        }

        // Google Calendar API Event object -> application DTO
        private static GoogleCalendarEventDto MapToDto(Event googleEvent)
        {
            return new GoogleCalendarEventDto
            {
                Title = googleEvent.Summary,
                Description = googleEvent.Description,
                Location = googleEvent.Location,
                StartTime = googleEvent.Start?.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
                EndTime = googleEvent.End?.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
                TimeZone = googleEvent.Start?.TimeZone
            };
        }
        #endregion

        #region inheritdoc
        public async Task<string> CreateEventAsync(string accessToken, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var service = GetCalendarService(accessToken);
                var googleEvent = MapToGoogleEvent(eventDto);

                _logger.LogInformation(
                    "Creating Google Calendar event: {Title} from {Start} to {End} on user's primary calendar",
                    eventDto.Title, eventDto.StartTime, eventDto.EndTime);

                var request = service.Events.Insert(googleEvent, "primary");
                var createdEvent = await request.ExecuteAsync(cancellationToken);

                _logger.LogInformation(
                    "Google Calendar event created successfully with ID: {EventId}",
                    createdEvent.Id);

                return createdEvent.Id;
            }
            #region ErrorHandling
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Conflict)
            {
                _logger.LogWarning(ex, "Conflict when creating Google Calendar event: {Title}", eventDto.Title);
                throw new InvalidOperationException(
                    $"A conflicting event already exists for '{eventDto.Title}'.", ex);
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex,
                    "Google Calendar API error while creating event: {Title}. Status: {StatusCode}",
                    eventDto.Title, ex.HttpStatusCode);
                throw new ExternalServiceException(
                    $"Failed to create Google Calendar event '{eventDto.Title}'. Google API error: {ex.Message}", ex);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Google Calendar CreateEvent was cancelled for: {Title}", eventDto.Title);
                throw;
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                _logger.LogError(ex, "Unexpected error creating Google Calendar event: {Title}", eventDto.Title);
                throw new ExternalServiceException(
                    $"Unexpected error creating Google Calendar event '{eventDto.Title}'.", ex);
            }
            #endregion
        }

        public async Task UpdateEventAsync(string accessToken, string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleEventId))
                throw new ArgumentException("Google event ID cannot be null or empty.", nameof(googleEventId));

            try
            {
                var service = GetCalendarService(accessToken);
                var googleEvent = MapToGoogleEvent(eventDto);

                _logger.LogInformation(
                    "Updating Google Calendar event: {EventId} on user's primary calendar", googleEventId);

                var request = service.Events.Update(googleEvent, "primary", googleEventId);
                await request.ExecuteAsync(cancellationToken);

                _logger.LogInformation(
                    "Google Calendar event {EventId} updated successfully", googleEventId);
            }
            #region ErrorHandling
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogWarning(ex,
                    "Google Calendar event not found for update: {EventId}", googleEventId);
                throw new KeyNotFoundException(
                    $"Google Calendar event '{googleEventId}' was not found.", ex);
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex,
                    "Google Calendar API error while updating event: {EventId}. Status: {StatusCode}",
                    googleEventId, ex.HttpStatusCode);
                throw new ExternalServiceException(
                    $"Failed to update Google Calendar event '{googleEventId}'. Google API error: {ex.Message}", ex);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Google Calendar UpdateEvent was cancelled for: {EventId}", googleEventId);
                throw;
            }
            catch (Exception ex) when (ex is not (KeyNotFoundException or InvalidOperationException))
            {
                _logger.LogError(ex, "Unexpected error updating Google Calendar event: {EventId}", googleEventId);
                throw new ExternalServiceException(
                    $"Unexpected error updating Google Calendar event '{googleEventId}'.", ex);
            }
            #endregion
        }

        public async Task DeleteEventAsync(string accessToken, string googleEventId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleEventId))
                throw new ArgumentException("Google event ID cannot be null or empty.", nameof(googleEventId));

            try
            {
                var service = GetCalendarService(accessToken);

                _logger.LogInformation(
                    "Deleting Google Calendar event: {EventId} from user's primary calendar", googleEventId);

                var request = service.Events.Delete("primary", googleEventId);
                await request.ExecuteAsync(cancellationToken);

                _logger.LogInformation(
                    "Google Calendar event {EventId} deleted successfully", googleEventId);
            }
            #region ErrorHandling
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogWarning(
                    "Google Calendar event {EventId} was not found during deletion (may have already been removed)",
                    googleEventId);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Gone)
            {
                _logger.LogWarning(
                    "Google Calendar event {EventId} was already deleted (410 Gone)",
                    googleEventId);
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex,
                    "Google Calendar API error while deleting event: {EventId}. Status: {StatusCode}",
                    googleEventId, ex.HttpStatusCode);
                throw new ExternalServiceException(
                    $"Failed to delete Google Calendar event '{googleEventId}'. Google API error: {ex.Message}", ex);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Google Calendar DeleteEvent was cancelled for: {EventId}", googleEventId);
                throw;
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                _logger.LogError(ex, "Unexpected error deleting Google Calendar event: {EventId}", googleEventId);
                throw new ExternalServiceException(
                    $"Unexpected error deleting Google Calendar event '{googleEventId}'.", ex);
            }
            #endregion
        }

        public async Task<GoogleCalendarEventDto?> GetEventAsync(string accessToken, string googleEventId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleEventId))
                throw new ArgumentException("Google event ID cannot be null or empty.", nameof(googleEventId));

            try
            {
                var service = GetCalendarService(accessToken);

                _logger.LogInformation(
                    "Retrieving Google Calendar event: {EventId} from user's primary calendar", googleEventId);

                var request = service.Events.Get("primary", googleEventId);
                var googleEvent = await request.ExecuteAsync(cancellationToken);

                _logger.LogInformation(
                    "Google Calendar event {EventId} retrieved successfully", googleEventId);

                return MapToDto(googleEvent);
            }
            #region ErrorHandling
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogWarning(
                    "Google Calendar event not found: {EventId}", googleEventId);
                return null;
            }
            catch (GoogleApiException ex)
            {
                _logger.LogError(ex,
                    "Google Calendar API error while retrieving event: {EventId}. Status: {StatusCode}",
                    googleEventId, ex.HttpStatusCode);
                throw new ExternalServiceException(
                    $"Failed to retrieve Google Calendar event '{googleEventId}'. Google API error: {ex.Message}", ex);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Google Calendar GetEvent was cancelled for: {EventId}", googleEventId);
                throw;
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                _logger.LogError(ex, "Unexpected error retrieving Google Calendar event: {EventId}", googleEventId);
                throw new ExternalServiceException(
                    $"Unexpected error retrieving Google Calendar event '{googleEventId}'.", ex);
            }
            #endregion
        }
        #endregion
    }

    public class ExternalServiceException : Exception
    {
        public ExternalServiceException(string message) : base(message) { }
        public ExternalServiceException(string message, Exception innerException) : base(message, innerException) { }
    }
}
