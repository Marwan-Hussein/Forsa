using Domain.Entities.EventEntities;
using Domain.Entities.PlaceEntities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class EventRepository : QueryableRepository<Event>, IEventRepository
    {
        public EventRepository(ForsaDbContext context) : base(context)
        {
            
        }
        public IQueryable<Event> GetQueryableWithPlace()
        {
            return _context.Set<Event>()
                .Include(Event => Event.Place)
                .AsQueryable();
        }
        public async Task<List<Event>> GetEventsWithPlaceAsync()
        {
            return await _context.Set<Event>()
                .Include(Event => Event.Place)
                .ToListAsync();
        }
        public async Task<Event> GetEventByEntityIdentifier(string entityIdentifier)
        {
            var Event = await _context.Set<Event>()
                .FirstOrDefaultAsync(e => e.Title.Contains(entityIdentifier));
            if (Event == null)
                throw new KeyNotFoundException($"Event with identifier '{entityIdentifier}' not found.");
            return Event;
        }
        public async Task<int> GetCountAsync()
        {
            return await _context.Set<Event>().CountAsync();
            
        }
    }
}
