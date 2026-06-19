using Application.Core.DTOs.Event;
using System.Collections.Generic;

namespace Application.Core.Interfaces.EventInterfaces
{
    public interface IEventService
    {
        Task<List<EventDetailsDto>> GetAllEvents();
        Task<EventDetailsDto?> GetEventById(int id);
        Task<List<EventDetailsDto>> FilterEventsByParameters(EventSearchParameterDto parameters);
        Task EvaluateEventStatusAsync(int eventId);
        Task<bool> DeductTicketInventoryAsync(int eventId, int quantity);
        Task ReleaseTicketInventoryAsync(int eventId, int quantity);
    }
}
