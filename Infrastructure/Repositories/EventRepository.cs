using Domain.Entities.EventEntities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;

namespace Infrastructure.Repositories
{
    public class EventRepository : QueryableRepository<Event>, IEventRepository
    {
        public EventRepository(ForsaDbContext context) : base(context)
        {
        }
    }
}
