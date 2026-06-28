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
using System.Net;

namespace Application.Services.ExternalServices
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        #region Attributes and ctor
        private readonly GoogleCalendarSettings _settings;
        private readonly ILogger<GoogleCalendarService> _logger;
        private CalendarService? _calendarService;

        public GoogleCalendarService(
            IOptions<GoogleCalendarSettings> settings,
            ILogger<GoogleCalendarService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }
        #endregion

        #region Helper Methods (privates)
        private async Task<CalendarService> GetCalendarServiceAsync()
        {
            if (_calendarService != null)
                return _calendarService;

            try
            {
                GoogleCredential credential;

                if (!string.IsNullOrWhiteSpace(_settings.ServiceAccountKeyPath)
                    && File.Exists(_settings.ServiceAccountKeyPath))
                {
                    // Load credentials from the service account key file
                    using var stream = new FileStream(
                        _settings.ServiceAccountKeyPath, FileMode.Open, FileAccess.Read);

#pragma warning disable CS0618 // GoogleCredential.FromStream is deprecated but CredentialFactory is not yet stable
                    credential = GoogleCredential.FromStream(stream)
                        .CreateScoped(CalendarService.Scope.Calendar);
#pragma warning restore CS0618
                }
                else
                {
                    // Fall back to Application Default Credentials (ADC)
                    // This works in GCP-hosted environments or when GOOGLE_APPLICATION_CREDENTIALS is set
                    credential = (await GoogleCredential.GetApplicationDefaultAsync())
                        .CreateScoped(CalendarService.Scope.Calendar);
                }

                _calendarService = new CalendarService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName = _settings.ApplicationName
                });

                _logger.LogInformation("Google Calendar service initialized successfully");
                return _calendarService;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Google Calendar service");
                throw new InvalidOperationException(
                    "Unable to initialize Google Calendar service. Check credentials configuration.", ex);
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
        public async Task<string> CreateEventAsync(GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {

            try
            {
                var service = await GetCalendarServiceAsync(); // Lazily initializes and returns the Google Calendar API client (using service account credentials)
                var googleEvent = MapToGoogleEvent(eventDto);

                _logger.LogInformation(
                    "Creating Google Calendar event: {Title} from {Start} to {End}",
                    eventDto.Title, eventDto.StartTime, eventDto.EndTime);

                var request = service.Events.Insert(googleEvent, _settings.CalendarId);
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
                    $"Failed to create Google Calendar event '{eventDto.Title}'.", ex);
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

        public async Task UpdateEventAsync(string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleEventId))
                throw new ArgumentException("Google event ID cannot be null or empty.", nameof(googleEventId));

            try
            {
                var service = await GetCalendarServiceAsync();
                var googleEvent = MapToGoogleEvent(eventDto);

                _logger.LogInformation(
                    "Updating Google Calendar event: {EventId}", googleEventId);

                var request = service.Events.Update(googleEvent, _settings.CalendarId, googleEventId);
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
                    $"Failed to update Google Calendar event '{googleEventId}'.", ex);
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
        public async Task DeleteEventAsync(string googleEventId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleEventId))
                throw new ArgumentException("Google event ID cannot be null or empty.", nameof(googleEventId));

            try
            {
                var service = await GetCalendarServiceAsync();

                _logger.LogInformation(
                    "Deleting Google Calendar event: {EventId}", googleEventId);

                var request = service.Events.Delete(_settings.CalendarId, googleEventId);
                await request.ExecuteAsync(cancellationToken);

                _logger.LogInformation(
                    "Google Calendar event {EventId} deleted successfully", googleEventId);
            }

            #region ErrorHandling
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                // Event already gone from Google Calendar — treat as idempotent success
                _logger.LogWarning(
                    "Google Calendar event {EventId} was not found during deletion (may have already been removed)",
                    googleEventId);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Gone)
            {
                // Event was already deleted — treat as idempotent success
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
                    $"Failed to delete Google Calendar event '{googleEventId}'.", ex);
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

        public async Task<GoogleCalendarEventDto?> GetEventAsync(string googleEventId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleEventId))
                throw new ArgumentException("Google event ID cannot be null or empty.", nameof(googleEventId));

            try
            {
                var service = await GetCalendarServiceAsync();

                _logger.LogInformation(
                    "Retrieving Google Calendar event: {EventId}", googleEventId);

                var request = service.Events.Get(_settings.CalendarId, googleEventId);
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
                    $"Failed to retrieve Google Calendar event '{googleEventId}'.", ex);
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
