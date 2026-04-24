using Application.Core.DTOs.Event;
using System.Collections.Generic;

namespace Application.Core.Interfaces
{
    // ✏️ Modified: Removed IGenericService<Event> inheritance to return DTOs instead of domain entities
    public interface IEventService
    {
        List<EventDetailsDto> GetAllEvents();
        EventDetailsDto? GetEventById(int id);
        List<EventDetailsDto> FilterEventsByParameters(EventSearchParameter parameters);
    }
}
