using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;

namespace Application.Services.ExternalServices
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        public Task<string> CreateEventAsync(GoogleCalendarEventDto eventDto, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task DeleteEventAsync(string googleEventId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task UpdateEventAsync(string googleEventId, GoogleCalendarEventDto eventDto, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
