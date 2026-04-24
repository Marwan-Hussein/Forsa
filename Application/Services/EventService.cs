using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
using Domain.Entities.EventEntities;
using Domain.Interfaces;

namespace Application.Services
{
    public class EventService : GenericService<Event>, IEventService
    {
        private readonly IEventRepository _repo;
        public EventService(IEventRepository repo) : base(repo){
            _repo = repo;
        }

        public List<Event> FilterEventsByParameters(EventSearchParameter criteria)
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
                switch (criteria.SortBy.ToLower())
                {
                    case "title":
                        events = criteria.IsDescending 
                            ? events.OrderByDescending(e => e.Title) 
                            : events.OrderBy(e => e.Title);
                        break;
                    case "location":
                        events = criteria.IsDescending 
                            ? events.OrderByDescending(e => e.Place) 
                            : events.OrderBy(e => e.Place);
                        break;
                    case "date":
                        events = criteria.IsDescending 
                            ? events.OrderByDescending(e => e.StartDate) 
                            : events.OrderBy(e => e.StartDate);
                        break;
                    case "price":
                        events = criteria.IsDescending 
                            ? events.OrderByDescending(e => e.TicketPrice) 
                            : events.OrderBy(e => e.TicketPrice);
                        break;
                    default:
                        // Default sorting by start date
                        events = criteria.IsDescending 
                            ? events.OrderByDescending(e => e.StartDate) 
                            : events.OrderBy(e => e.StartDate);
                        break;
                }
            }
            else
            {
                // Default sorting by start date ascending
                events = events.OrderBy(e => e.StartDate);
            }

            return events.ToList(); 
        }
    }
}
