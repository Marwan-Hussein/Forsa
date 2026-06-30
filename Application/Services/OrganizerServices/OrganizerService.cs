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

            var existingRequest = await _bookingRequestRepository.GetQueryable()
                .FirstOrDefaultAsync(r => r.EventId == eventId 
                                       && r.PlaceId == placeId 
                                       && r.OrganizerId == dto.OrganizerId 
                                       && !r.IsDeleted 
                                       && (r.Status == RequestStatus.Pending || r.Status == RequestStatus.Accepted));

            if (existingRequest != null)
            {
                throw new InvalidOperationException($"You already have a {existingRequest.Status.ToString().ToLower()} booking request for this place and event.");
            }

            var request = new BookingRequest
            {
                EventId = eventId,
                PlaceId = placeId,
                OrganizerId = dto.OrganizerId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = RequestStatus.Pending,
                RequestedDate = dto.RequestedDate,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _bookingRequestRepository.AddAsync(request);
            await _unitOfWork.SaveChangesAsync();

            // Fetch the fully populated request from DB so the DTO mapping has Organizer and Place names
            var populatedRequest = await _bookingRequestRepository.GetQueryable()
                .Include(r => r.Organizer)
                .Include(r => r.Place)
                .FirstOrDefaultAsync(r => r.Id == request.Id);

            return _mapper.Map<BookingRequestDetailsDto>(populatedRequest ?? request);
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

        public async Task<List<BookingRequestDetailsDto>> GetOrganizerBookingRequestsAsync(int organizerId)
        {
            var requests = await _bookingRequestRepository.GetQueryable()
                .Include(r => r.Organizer)
                .Include(r => r.Place)
                .Where(r => r.OrganizerId == organizerId && !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<BookingRequestDetailsDto>>(requests);
        }

        public async Task<List<TicketRequestDto>> GetOrganizerTicketRequestsAsync(int organizerId)
        {
            var bookings = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .Include(b => b.Attendee)
                .Where(b => b.Event.OrganizerId == organizerId && !b.IsDeleted)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            return bookings.Select(b => new TicketRequestDto
            {
                Id = b.Id,
                EventId = b.EventId,
                EventTitle = b.Event?.Title ?? "Unknown Event",
                AttendeeId = b.AttendeeId,
                AttendeeName = b.Attendee?.FullName ?? "Unknown Attendee",
                AttendeeEmail = b.Attendee?.Email ?? "Unknown",
                AttendeePhone = b.Attendee?.PhoneNumber ?? "Unknown",
                RequestDate = b.BookingDate,
                Status = b.Status.ToString(),
                Tickets = b.NumberOfTickets,
                SpecialRequests = b.SpecialRequests,
                RejectionReason = b.RejectionReason
            }).ToList();
        }

        public async Task<List<OrganizerEventDashboardDto>> GetOrganizerEventsDashboardAsync(int organizerId)
        {
            var events = await _eventRepository.GetQueryable()
                .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
                .OrderByDescending(e => e.StartDate)
                .ToListAsync();

            return events.Select(e => new OrganizerEventDashboardDto
            {
                EventId = e.Id,
                Title = e.Title,
                Status = e.Status.ToString(),
                TotalTickets = e.TotalTickets,
                RemainingTickets = e.RemainingTickets
            }).ToList();
        }
        public async Task<OrganizerDashboardStatsDto> GetOrganizerDashboardStatsAsync(int organizerId)
        {
            var events = await _eventRepository.GetQueryable()
                .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
                .ToListAsync();

            var totalEvents = events.Count;
            var completedEvents = events.Count(e => e.Status == EventStatus.Completed);
            var pendingEvents = events.Count(e => e.Status == EventStatus.Pending || e.Status == EventStatus.Draft);

            var totalTicketsSold = events.Sum(e => e.TotalTickets - e.RemainingTickets);
            var totalRevenue = events.Sum(e => (decimal)((e.TotalTickets - e.RemainingTickets) * e.TicketPrice));

            var bookingRequests = await _bookingRequestRepository.GetQueryable()
                .Where(r => r.OrganizerId == organizerId && r.Status == RequestStatus.Accepted && !r.IsDeleted)
                .ToListAsync();

            return new OrganizerDashboardStatsDto
            {
                TotalEvents = totalEvents,
                CompletedEvents = completedEvents,
                PendingEvents = pendingEvents,
                TotalTicketsSold = totalTicketsSold,
                TotalRevenue = totalRevenue,
                TotalPlacesBooked = bookingRequests.Count
            };
        }
        public async Task<List<EventAttendeeDto>> GetEventAttendeesAsync(int eventId)
        {
            var bookings = await _bookingRepository.GetQueryable()
                .Include(b => b.Attendee)
                .Where(b => b.EventId == eventId && !b.IsDeleted)
                .ToListAsync();

            return bookings.Select(b => new EventAttendeeDto
            {
                BookingId = b.Id,
                AttendeeId = b.AttendeeId,
                FullName = b.Attendee?.FullName ?? "Unknown",
                Email = b.Attendee?.Email ?? "Unknown",
                PhoneNumber = b.Attendee?.PhoneNumber ?? "Unknown",
                NumberOfTickets = b.NumberOfTickets,
                TicketType = "General", // Placeholder for actual logic
                BookingDate = b.BookingDate,
                CheckInStatus = b.Status.ToString(), 
                CheckInTime = b.Status == BookingStatus.Attended ? b.BookingDate.ToString("yyyy-MM-dd HH:mm") : null,
                PaymentStatus = "paid" // Adjust based on logic
            }).ToList();
        }

        public async Task ManualCheckInAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetQueryable()
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            if (booking.Status == BookingStatus.Cancelled)
                throw new InvalidOperationException("Cannot check in a cancelled booking");

            if (booking.Status == BookingStatus.Rejected)
                throw new InvalidOperationException("Cannot check in a rejected booking");
            
            if (booking.Status == BookingStatus.Pending)
                throw new InvalidOperationException("Booking is pending approval");

            if (booking.Status == BookingStatus.Attended)
                throw new InvalidOperationException("Attendee has already checked in");

            booking.Status = BookingStatus.Attended;
            _bookingRepository.Update(booking);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
