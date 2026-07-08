using Application.Core.DTOs.Event;
using Application.Core.Interfaces.EventInterfaces;
using Application.Core.Interfaces;
using Application.Core.DTOs.CommonDTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.EventEntities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using Domain.ENUMs;
using Application.Core.DTOs.Feedbacks;

namespace Application.Services.EventServices
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _repo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFeedbackRepository feedbackRepo;


        private readonly INotifierService _notifierService;
        private readonly IQueryableRepository<Domain.Entities.BookingEntities.BookingRequest> _bookingRequestRepo;
        private readonly IQueryableRepository<Domain.Entities.PlaceEntities.PlaceAvailability> _availabilityRepo;

        private readonly IGenericRepository<Notification> _notificationRepository;

        public EventService(
            IEventRepository repo, 
            IMapper mapper, 
            IUnitOfWork unitOfWork, 
            IFeedbackRepository feedbackRepo,
            IQueryableRepository<Domain.Entities.BookingEntities.BookingRequest> bookingRequestRepo,
            IGenericRepository<Notification> notificationRepository,
            INotifierService notifierService,
            IQueryableRepository<Domain.Entities.PlaceEntities.PlaceAvailability> availabilityRepo)
        {
            _repo = repo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            this.feedbackRepo = feedbackRepo;
            _notificationRepository = notificationRepository;
            _notifierService = notifierService;
            _bookingRequestRepo = bookingRequestRepo;
            _availabilityRepo = availabilityRepo;
        }

        public async Task<List<EventDetailsDto>> GetAllEvents()
        {
            var events = await _repo.GetQueryable()
                                    .Include(e => e.Place)
                                    .Include(e => e.EventMedias)
                                    .Where(e => !e.IsDeleted)
                                    .ToListAsync();
            return _mapper.Map<List<EventDetailsDto>>(events);
        }

        public async Task<EventDetailsDto?> GetEventById(int id)
        {
            var ev = await _repo.GetQueryable()
                                .Include(e => e.Place)
                                .Include(e => e.EventMedias)
                                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
            return ev == null ? null : _mapper.Map<EventDetailsDto>(ev);
        }

        public async Task<List<EventDetailsDto>> FilterEventsByParameters(EventSearchParameterDto criteria)
        {
            criteria ??= new EventSearchParameterDto();

            var events = _repo.GetQueryable()
                              .Include(e => e.Place)
                              .Include(e => e.EventMedias)
                              .Where(e => !e.IsDeleted);

            if (!string.IsNullOrWhiteSpace(criteria.EventName))
                events = events.Where(E => E.Title.Contains(criteria.EventName));

            //if (!string.IsNullOrWhiteSpace(criteria.EventLocation))
            //    events = events.Where(E => E.Place.Contains(criteria.EventLocation));

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
            int points = (int)(10 + eventEntity.TicketPrice / 10);
            foreach (var booking in eventEntity.Bookings
                .Where(b =>
                    b.Status == BookingStatus.Confirmed &&
                    b.Attendee != null))
            {
                booking.Attendee.LoyaltyPoint += points; // final calculation of attendee ratings

                #region notification
                var notification = new Notification
                {
                    Message = $"Your loyalty points have been increased by {points} points for attending the event '{eventEntity.Title}'!",
                    Type = NotificationType.GeneralAlert,
                    SentVia = DeliveryMethod.Email,
                    Status = NotificationStatus.Pending,
                    UserId = booking.AttendeeId,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepository.AddAsync(notification);
                #endregion
            }
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
                await CalculateAttendeeRatings(eventEntity); // Update attendee ratings based on bookings
                // Revert booking requested place slot back to Available
                if (eventEntity.PlaceId.HasValue)
                {
                    var request = await _bookingRequestRepo.GetQueryable()
                        .FirstOrDefaultAsync(r => r.EventId == eventEntity.Id && r.Status == RequestStatus.Accepted && !r.IsDeleted);
                    if (request != null)
                    {
                        var slot = await _availabilityRepo.GetQueryable()
                            .FirstOrDefaultAsync(a => a.PlaceId == request.PlaceId 
                                                      && a.Date.Date == request.RequestedDate.Date 
                                                      && a.Status == PlaceStatus.Booked
                                                      && !a.IsDeleted);
                        if (slot != null)
                        {
                            slot.Status = PlaceStatus.Available;
                            slot.LastModifiedAt = DateTime.UtcNow;
                            _availabilityRepo.Update(slot);
                        }
                    }
                }

                _repo.Update(eventEntity);
                await _unitOfWork.SaveChangesAsync();

                if (eventEntity.Bookings != null)
                {
                    int points = (int)(10 + eventEntity.TicketPrice / 10);
                    foreach (var booking in eventEntity.Bookings
                        .Where(b => 
                            b.Status == BookingStatus.Confirmed && 
                            b.Attendee != null))
                    {
                        try
                        {
                            await _notifierService.SendAsync(booking.AttendeeId, new NotificationMessageDto
                            {
                                Title = "Loyalty Points Increased",
                                Body = $"Your loyalty points have been increased by {points} points for attending the event '{eventEntity.Title}'!",
                                Type = NotificationType.GeneralAlert.ToString()
                            });
                        }
                        catch
                        {
                            // Silence real-time notification failures to prevent blocking execution
                        }
                    }
                }
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
            if (quantity == 0 || quantity + eventEntity.RemainingTickets > eventEntity.TotalTickets)
                throw new InvalidOperationException("Invalid quantity to release");

            eventEntity.RemainingTickets += quantity;

            if (eventEntity.Status == EventStatus.SoldOut)
                eventEntity.Status = EventStatus.Published;

            _repo.Update(eventEntity);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<ShareEventDto> GetShareableLinkAsync(int eventId, string baseUrl)
        {
            var eventEntity = await _repo.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event not found.");

            var shareUrl = $"{baseUrl.TrimEnd('/')}/api/events/{eventEntity.Id}/details";

            return new ShareEventDto
            {
                EventId = eventEntity.Id,
                Title = eventEntity.Title,
                ShareUrl = shareUrl,
                ShareText = $"Check out \"{eventEntity.Title}\" on Forsa! {shareUrl}"
            };
        }
        // get all feedbacks for a specific event
        public async Task<List<FeedbackDTO>> GetEventFeedbacks(int eventId)
        {
            var feedbacks = await feedbackRepo.GetQueryable()
                .Where(f => f.EventId == eventId && !f.IsDeleted)
                .Include(f => f.Attendee)
                .Include(f => f.Event)
                .ToListAsync();
            List<FeedbackDTO> mappedFeedbacks = new List<FeedbackDTO>();
            foreach (var feedback in feedbacks)
            {
                var FeedbackDTO = new FeedbackDTO
                {
                    Rating = feedback.Rating,
                    Comment = feedback.Comment,
                    AttendeeName = feedback.Attendee != null ? feedback.Attendee.FullName : "Anonymous",
                    EventTitle = feedback.Event != null ? feedback.Event.Title : "Unknown Event",
                    attendeeImageUrl = feedback.Attendee != null ? feedback.Attendee.ProfilePicture : null,
                    attendeeId = feedback.Attendee != null ? feedback.Attendee.Id : 0 
                };
                mappedFeedbacks.Add(FeedbackDTO);
            }
            return mappedFeedbacks;
        }
    }
}
