using Application.Core.DTOs.Event;
using System.Collections.Generic;

namespace Application.Core.Interfaces
{
    public interface IEventService
    {
        Task<List<EventDetailsDto>> GetAllEvents();
        Task<EventDetailsDto?> GetEventById(int id);
        Task<List<EventDetailsDto>> FilterEventsByParameters(EventSearchParameter parameters);
    }
}
