using Domain.Entities.EventEntities;

namespace Domain.Interfaces
{
    public interface IEventRepository : IQueryableRepository<Event>
    {
        public IQueryable<Event> GetQueryableWithPlace();
        public Task<List<Event>> GetEventsWithPlaceAsync();
        public Task<Event> GetEventByEntityIdentifier(string entityIdentifier);
    }
}
