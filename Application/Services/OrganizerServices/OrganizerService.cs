using Application.Core.DTOs.Organizer;
using Application.Core.DTOs.Event;
using Application.Core.DTOs.Booking;
using Application.Core.Interfaces.OrganizerInterfaces;
using Application.Core.Interfaces;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.EventEntities;
using Domain.Entities.BookingEntities;
using Domain.Entities;
using Domain.ENUMs;
using Domain.Interfaces.OrganizerInterfaces;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrganizerServices
{
    public class OrganizerService : IOrganizerService
    {
        private readonly IOrganizerRepository _organizerRepo;
        private readonly IQueryableRepository<Event> _eventRepository;
        private readonly IQueryableRepository<Booking> _bookingRepository;
        private readonly IQueryableRepository<BookingRequest> _bookingRequestRepository;
        private readonly IGenericRepository<Notification> _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrganizerService(
            IOrganizerRepository organizerRepo,
            IQueryableRepository<Event> eventRepository,
            IQueryableRepository<Booking> bookingRepository,
            IQueryableRepository<BookingRequest> bookingRequestRepository,
            IGenericRepository<Notification> notificationRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _organizerRepo = organizerRepo;
            _eventRepository = eventRepository;
            _bookingRepository = bookingRepository;
            _bookingRequestRepository = bookingRequestRepository;
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<Organizer>> FilterOrganizers(OrganizerSearchParameters searchParameter)
        {
            var result = _organizerRepo.GetQueryable();
            // Filter By Full Name
            if (!string.IsNullOrWhiteSpace(searchParameter.FullName))
            {
                result = _organizerRepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.FullName));
            }

            // Filter By Username
            if (!string.IsNullOrWhiteSpace(searchParameter.UserName))
            {
                result = _organizerRepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.UserName));
            }

            // Filter By Email
            if (!string.IsNullOrWhiteSpace(searchParameter.Email))
            {
                result = _organizerRepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.Email));
            }

            // Filter By Location
            if (!string.IsNullOrWhiteSpace(searchParameter.Location))
            {
                result = _organizerRepo.GetQueryable()
                               .Where(o => o.FullName
                               .Contains(searchParameter.Location));
            }
            if (!string.IsNullOrWhiteSpace(searchParameter.OrganizationName))
            {
                result = _organizerRepo.GetQueryable()
                               .Where(o => o.OrganizationName
                               .Contains(searchParameter.OrganizationName));
            }

            // Sorting
            result = searchParameter.IsDescending ? result.OrderByDescending(o => o.FullName): result.OrderBy(o => o.FullName);

            return await result.ToListAsync();
        }

        public async Task<EventDetailsDto> CreateEventAsync(CreateEventDto dto)
        {
            var newEvent = new Event
            {
                OrganizerId = dto.OrganizerId,
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                TicketPrice = dto.TicketPrice,
                TotalTickets = dto.TotalTickets,
                RemainingTickets = dto.TotalTickets,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = EventStatus.Draft,
                IsDeleted = false
            };

            await _eventRepository.AddAsync(newEvent);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<EventDetailsDto>(newEvent);
        }

        public async Task<EventDetailsDto> UpdateEventDetailsAsync(int eventId, UpdateEventDto dto)
        {
            var ev = await _eventRepository.GetQueryable()
                        .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (ev == null)
                throw new KeyNotFoundException("Event not found");

            if (ev.StartDate <= DateTime.UtcNow || ev.Status == EventStatus.Completed)
                throw new InvalidOperationException("Cannot modify an event that has already started or concluded.");

            ev.Title = dto.Title;
            ev.Description = dto.Description;
            ev.Category = dto.Category;
            ev.StartDate = dto.StartDate;
            ev.EndDate = dto.EndDate;

            _eventRepository.Update(ev);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<EventDetailsDto>(ev);
        }

        public async Task CancelEventAsync(int eventId)
        {
            var ev = await _eventRepository.GetQueryable()
                .Include(e => e.Bookings)
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (ev == null)
                throw new KeyNotFoundException("Event not found");

            ev.Status = EventStatus.Cancelled;
            ev.IsDeleted = true;
            _eventRepository.Update(ev);

            // Void current attendee bookings and notify
            if (ev.Bookings != null)
            {
                foreach (var booking in ev.Bookings)
                {
                    if (booking.Status != BookingStatus.Cancelled)
                    {
                        booking.Status = BookingStatus.Cancelled;
                        _bookingRepository.Update(booking);

                        // Alert attendee
                        var notification = new Notification
                        {
                            Type = NotificationType.EventUpdate,
                            SentVia = DeliveryMethod.Email,
                            UserId = booking.AttendeeId,
                            Message = $"The event '{ev.Title}' has been cancelled.",
                            Status = NotificationStatus.Pending,
                            IsDeleted = false
                        };
                        await _notificationRepository.AddAsync(notification);
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<BookingRequestDetailsDto> SubmitPlaceBookingRequestAsync(int eventId, int placeId, BookingRequestDto dto)
        {
            var ev = await _eventRepository.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (ev == null)
                throw new KeyNotFoundException("Event not found");

            if (ev.StartDate <= DateTime.UtcNow)
                throw new InvalidOperationException("Event date must be in the future to submit a booking request.");

            var request = new BookingRequest
            {
                EventId = eventId,
                PlaceId = placeId,
                OrganizerId = dto.OrganizerId,
                Status = RequestStatus.Pending,
                IsDeleted = false
            };

            await _bookingRequestRepository.AddAsync(request);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<BookingRequestDetailsDto>(request);
        }

        public async Task CancelPendingBookingRequestAsync(int requestId)
        {
            var request = await _bookingRequestRepository.GetQueryable()
                .FirstOrDefaultAsync(r => r.Id == requestId && !r.IsDeleted);

            if (request == null)
                throw new KeyNotFoundException("Booking request not found");

            if (request.Status != RequestStatus.Pending)
                throw new InvalidOperationException("Can only cancel pending booking requests.");

            request.Status = RequestStatus.Cancelled;
            request.IsDeleted = true;
            request.DeletedAt = DateTime.UtcNow; 
            
            _bookingRequestRepository.Update(request);

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
