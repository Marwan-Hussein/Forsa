using Application.Core.DTOs.Event;
using System.Collections.Generic;

namespace Application.Core.Interfaces
{
    public interface IEventService
    {
        List<EventDetailsDto> GetAllEvents();
        EventDetailsDto? GetEventById(int id);
        List<EventDetailsDto> FilterEventsByParameters(EventSearchParameter parameters);
    }
}
