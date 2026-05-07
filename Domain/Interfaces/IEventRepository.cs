using Domain.Entities.EventEntities;

namespace Domain.Interfaces
{
    public interface IEventRepository : IQueryableRepository<Event>
    {
    }
}
