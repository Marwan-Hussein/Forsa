using Application.Core.Interfaces;
using Domain.Entities.EventEntities;
using Domain.Interfaces;

namespace Application.Services
{
    public class EventService : GenericService<Event>, IEventService
    {
        private readonly IEventRepository _repo;
        public EventService(IGenericRepository<Event> repo) : base(repo){
            _repo = repo;
        }

        public List<Event> FilterEvents(EventSearchParameter criteria)
        {
            IQueryable<Event> events = GetAll().AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.EventName))
                events = events.Where(E => E.Title.Contains(criteria.EventName));

            if (!string.IsNullOrWhiteSpace(criteria.EventLocation))
                events = events.Where(E => E.Place.Contains(criteria.EventLocation));

            if (!string.IsNullOrWhiteSpace(criteria.EventCategory))
                events = events.Where(E => E.Category.Contains(criteria.EventCategory));

            if (!string.IsNullOrWhiteSpace(criteria.SortBy))
            {
                if (criteria.SortBy.ToLower() == "title")
                {
                    events = criteria.IsDescending 
                        ? events.OrderByDescending(e => e.Title) 
                        : events.OrderBy(e => e.Title);
                }
                else if (criteria.SortBy.ToLower() == "location")
                {
                    events = criteria.IsDescending 
                        ? events.OrderByDescending(e => e.Place) 
                        : events.OrderBy(e => e.Place);
                }
            }

            return events.ToList(); 
        }
    }
}
