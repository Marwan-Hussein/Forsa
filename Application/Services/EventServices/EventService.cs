using Application.Core.DTOs.Event;
using Application.Core.Interfaces.EventInterfaces;
using AutoMapper;
using Domain.Entities.EventEntities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using Domain.ENUMs;

namespace Application.Services.EventServices
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _repo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public EventService(IEventRepository repo, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _repo = repo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<EventDetailsDto>> GetAllEvents()
        {
            var events = await _repo.GetQueryable()
                                    .Where(e => !e.IsDeleted)
                                    .ToListAsync();
            return _mapper.Map<List<EventDetailsDto>>(events);
        }

        public async Task<EventDetailsDto?> GetEventById(int id)
        {
            var ev = await _repo.GetQueryable()
                                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
            return ev == null ? null : _mapper.Map<EventDetailsDto>(ev);
        }

        public async Task<List<EventDetailsDto>> FilterEventsByParameters(EventSearchParameterDto criteria)
        {
            criteria ??= new EventSearchParameterDto();

            var events = _repo.GetQueryable()
                              .Where(e => !e.IsDeleted);

            if (!string.IsNullOrWhiteSpace(criteria.EventName))
                events = events.Where(E => E.Title.Contains(criteria.EventName));

            if (!string.IsNullOrWhiteSpace(criteria.EventLocation))
                events = events.Where(E => E.Place.Contains(criteria.EventLocation));

            if (!string.IsNullOrWhiteSpace(criteria.EventCategory))
                events = events.Where(E => E.Category.Contains(criteria.EventCategory));

            if (criteria.Status.HasValue)
                events = events.Where(E => E.Status == criteria.Status.Value);

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
            else
            {
                events = events.OrderBy(e => e.Id);
            }

            return _mapper.Map<List<EventDetailsDto>>(await events.ToListAsync()); 
        }
        private async Task CalculateAttendeeRatings(Event eventEntity)
        {
            if (eventEntity.Bookings == null)
                return;

            foreach (var booking in eventEntity.Bookings
                .Where(b => 
                    b.Status == BookingStatus.Confirmed && 
                    b.Attendee != null))
                booking.Attendee.LoyaltyPoint += 10; // final calculation of attendee ratings
        }
        public async Task EvaluateEventStatusAsync(int eventId)
        {
            var eventEntity = await _repo.GetQueryable()
                .Include(e => e.Bookings)
                    .ThenInclude(b => b.Attendee)
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event not found");

            if ((eventEntity.Status == EventStatus.Published || eventEntity.Status == EventStatus.SoldOut) 
                && eventEntity.EndDate <= DateTime.UtcNow)
            {
                eventEntity.Status = EventStatus.Completed;
                eventEntity.RemainingTickets = 0; // Locks further bookings
                CalculateAttendeeRatings(eventEntity).Wait(); // Update attendee ratings based on bookings


                _repo.Update(eventEntity);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        public async Task<bool> DeductTicketInventoryAsync(int eventId, int quantity)
        {
            var eventEntity = await _repo.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (eventEntity == null || eventEntity.RemainingTickets < quantity)
                return false;

            eventEntity.RemainingTickets -= quantity;
            
            if (eventEntity.RemainingTickets == 0)
                eventEntity.Status = EventStatus.SoldOut;

            _repo.Update(eventEntity);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task ReleaseTicketInventoryAsync(int eventId, int quantity)
        {
            var eventEntity = await _repo.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event not found");
            if(quantity == 0 || quantity + eventEntity.RemainingTickets > eventEntity.TotalTickets)
                throw new InvalidOperationException("Invalid quantity to release");

            eventEntity.RemainingTickets += quantity;

            if (eventEntity.Status == EventStatus.SoldOut)
                eventEntity.Status = EventStatus.Published;

            _repo.Update(eventEntity);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
