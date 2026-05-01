using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
using AutoMapper;
using Domain.Entities.EventEntities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace Application.Services
{
    public class EventService : IEventService
    {
        private readonly IQueryableRepository<Event> _repo;
        private readonly IMapper _mapper;

        public EventService(IQueryableRepository<Event> repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<List<EventDetailsDto>> GetAllEvents()
        {
            var events = await _repo.GetAllAsync();
            return _mapper.Map<List<EventDetailsDto>>(events);
        }

        public async Task<EventDetailsDto?> GetEventById(int id)
        {
            var ev = await _repo.GetByIdAsync(id);
            return ev == null ? null : _mapper.Map<EventDetailsDto>(ev);
        }

        public async Task<List<EventDetailsDto>> FilterEventsByParameters(EventSearchParameter criteria)
        {
            var events = _repo.GetQueryable();

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

            return _mapper.Map<List<EventDetailsDto>>(await events.ToListAsync()); 
        }
    }
}
