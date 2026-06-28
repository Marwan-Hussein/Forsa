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

        public Task<string> CreateEventAsync(GoogleCalendarEventDto eventDto, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
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
