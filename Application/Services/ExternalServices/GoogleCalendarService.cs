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

        // application DTO -> Google Calendar API Event object.
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
        #endregion

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

            // HANDLING
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
        }

        public Task DeleteEventAsync(string googleEventId, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<GoogleCalendarEventDto?> GetEventAsync(string googleEventId, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task UpdateEventAsync(string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }
    }


    public class ExternalServiceException : Exception
    {
        public ExternalServiceException(string message) : base(message) { }
        public ExternalServiceException(string message, Exception innerException) : base(message, innerException) { }
    }
}
