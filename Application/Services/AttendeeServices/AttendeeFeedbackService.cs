using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using Application.Core.Interfaces;
using Application.Core.DTOs.CommonDTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.Entities.OrganizerEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Domain.Interfaces.OrganizerInterfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services.AttendeeServices
{
    public class AttendeeFeedbackService : IAttendeeFeedbackService
    {
        private readonly IQueryableRepository<Attendee> _attendeeRepo;
        private readonly IQueryableRepository<Event> _eventRepo;
        private readonly IQueryableRepository<Booking> _bookingRepo;
        private readonly IQueryableRepository<BookingRequest> _bookingRequestRepo;
        private readonly IOrganizerRepository _organizerRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IGenericRepository<Notification> _notificationRepository;
        private readonly INotifierService _notifierService;

        public AttendeeFeedbackService(
            IQueryableRepository<Attendee> attendeeRepo,
            IQueryableRepository<Event> eventRepo,
            IQueryableRepository<Booking> bookingRepo,
            IQueryableRepository<BookingRequest> bookingRequestRepo,
            IOrganizerRepository organizerRepo,
            IFeedbackRepository feedbackRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IGenericRepository<Notification> notificationRepository,
            INotifierService notifierService)
        {
            _attendeeRepo = attendeeRepo;
            _eventRepo = eventRepo;
            _bookingRepo = bookingRepo;
            _bookingRequestRepo = bookingRequestRepo;
            _organizerRepo = organizerRepo;
            _feedbackRepo = feedbackRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _notificationRepository = notificationRepository;
            _notifierService = notifierService;
        }

        public async Task<FeedbackResponseDto> SubmitAttendeeFeedbackAsync(int attendeeId, int eventId, FeedbackDto dto)
        {
            // 1. Validate Attendee
            var attendee = await _attendeeRepo.GetQueryable()
                .FirstOrDefaultAsync(a => a.Id == attendeeId && !a.IsDeleted);
            if (attendee == null)
                throw new KeyNotFoundException("Attendee not found.");

            // 2. Validate Event
            var ev = await _eventRepo.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);
            if (ev == null)
                throw new KeyNotFoundException("Event not found.");

            // 3. Verify Booking & Attendance
            var booking = await _bookingRepo.GetQueryable()
                .FirstOrDefaultAsync(b => b.AttendeeId == attendeeId && b.EventId == eventId && !b.IsDeleted);
            if (booking == null)
                throw new InvalidOperationException("You do not have a booking for this event.");

            if (booking.Status != BookingStatus.Attended)
                throw new InvalidOperationException("You can only submit feedback for events you have attended.");

            // 4. Verify No Duplicate Feedback
            var existingFeedback = await _feedbackRepo.GetQueryable()
                .FirstOrDefaultAsync(f => f.AttendeeId == attendeeId && f.EventId == eventId && !f.IsDeleted);
            if (existingFeedback != null)
                throw new InvalidOperationException("You have already submitted feedback for this event.");

            // 5. Fetch Organizer ID from accepted BookingRequest
            var bookingRequest = await _bookingRequestRepo.GetQueryable()
                .Include(br => br.Organizer)
                .FirstOrDefaultAsync(br => br.EventId == eventId && br.Status == RequestStatus.Accepted && !br.IsDeleted);

            int? organizerId = bookingRequest?.OrganizerId;
            string organizerName = bookingRequest?.Organizer?.FullName ?? "Unknown Organizer";

            // 6. Create Feedback Entity
            var feedback = new Feedback
            {
                Rating = dto.Rating,
                Comment = dto.Comment,
                AttendeeId = attendeeId,
                EventId = eventId,
                OrganizerId = organizerId,
                CreatedAt = DateTime.UtcNow
            };

            await _feedbackRepo.AddAsync(feedback);

            // 7. Update Event rating
            double currentEventAvg = ev.AverageRating;
            int currentEventReviews = ev.ReviewsCount;
            ev.AverageRating = ((currentEventAvg * currentEventReviews) + dto.Rating) / (currentEventReviews + 1);
            ev.ReviewsCount += 1;
            _eventRepo.Update(ev);

            // 8. Update Organizer rating
            if (organizerId.HasValue)
            {
                var organizer = await _organizerRepo.GetQueryable()
                    .FirstOrDefaultAsync(o => o.Id == organizerId.Value && !o.IsDeleted);
                if (organizer != null)
                {
                    double currentOrgAvg = organizer.AverageRating;
                    int currentOrgReviews = organizer.ReviewsCount;
                    organizer.AverageRating = ((currentOrgAvg * currentOrgReviews) + dto.Rating) / (currentOrgReviews + 1);
                    organizer.ReviewsCount += 1;
                    _organizerRepo.Update(organizer);
                }
            }

            #region notification
            // Create notification for event organizer
            var notification = new Notification
            {
                Message = $"Attendee '{attendee.FullName}' has submitted feedback for your event '{ev.Title}'.",
                Type = NotificationType.GeneralAlert,
                SentVia = DeliveryMethod.Email,
                Status = NotificationStatus.Pending,
                UserId = ev.OrganizerId,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);

            // 9. Save changes and map
            await _unitOfWork.SaveChangesAsync();

            try
            {
                await _notifierService.SendAsync(ev.OrganizerId, new NotificationMessageDto
                {
                    Title = "New Event Feedback",
                    Body = $"Attendee '{attendee.FullName}' has submitted feedback for your event '{ev.Title}'.",
                    Type = NotificationType.GeneralAlert.ToString()
                });
            }
            catch
            {
                // Silence real-time notification failures to prevent blocking execution
            }
            #endregion
            var response = _mapper.Map<FeedbackResponseDto>(feedback);
            response.OrganizerId = organizerId;
            response.OrganizerName = organizerName;

            return response;
        }
    }
}
