using Application.Core.Interfaces;
using Domain.Entities.EventEntities;

namespace Application.Core.Interfaces
{
    public interface IEventService : IGenericService<Event>
    {
        List<Event> FilterEventsByParameters(EventSearchParameters parameters);
    }
}
