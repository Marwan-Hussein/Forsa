using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.DTOs.Feedbacks;
using Application.Core.Interfaces.AttendeeInterfaces;
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

        public AttendeeFeedbackService(
            IQueryableRepository<Attendee> attendeeRepo,
            IQueryableRepository<Event> eventRepo,
            IQueryableRepository<Booking> bookingRepo,
            IQueryableRepository<BookingRequest> bookingRequestRepo,
            IOrganizerRepository organizerRepo,
            IFeedbackRepository feedbackRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _attendeeRepo = attendeeRepo;
            _eventRepo = eventRepo;
            _bookingRepo = bookingRepo;
            _bookingRequestRepo = bookingRequestRepo;
            _organizerRepo = organizerRepo;
            _feedbackRepo = feedbackRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
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

            // 9. Save changes and map
            await _unitOfWork.SaveChangesAsync();

            var response = _mapper.Map<FeedbackResponseDto>(feedback);
            response.OrganizerId = organizerId;
            response.OrganizerName = organizerName;

            return response;
        }
        public async Task<UpdateFeedbackDTO> EditAttendeeFeedbackAsync(
                                                                        int attendeeId,
                                                                        int eventId,
                                                                        UpdateFeedbackDTO dto)
        {
            // Validate attendee
            var attendee = await _attendeeRepo.GetQueryable()
                .FirstOrDefaultAsync(a => a.Id == attendeeId && !a.IsDeleted);

            if (attendee == null)
                throw new KeyNotFoundException("Attendee not found.");

            // Validate event
            var ev = await _eventRepo.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (ev == null)
                throw new KeyNotFoundException("Event not found.");

            // Get existing feedback
            var feedback = await _feedbackRepo.GetQueryable()
                .FirstOrDefaultAsync(f =>
                    f.AttendeeId == attendeeId &&
                    f.EventId == eventId &&
                    !f.IsDeleted);

            if (feedback == null)
                throw new KeyNotFoundException("Feedback not found.");

            // Store old rating
            int oldRating = feedback.Rating;

            // Update feedback
            feedback.Rating = dto.Rating;
            feedback.Comment = dto.Comment;

            _feedbackRepo.Update(feedback);

            // Update Event Rating
            if (ev.ReviewsCount > 0)
            {
                ev.AverageRating =
                    ((ev.AverageRating * ev.ReviewsCount) - oldRating + dto.Rating)
                    / ev.ReviewsCount;

                _eventRepo.Update(ev);
            }

            // Update Organizer Rating
            if (feedback.OrganizerId.HasValue)
            {
                var organizer = await _organizerRepo.GetQueryable()
                    .FirstOrDefaultAsync(o =>
                        o.Id == feedback.OrganizerId &&
                        !o.IsDeleted);

                if (organizer != null && organizer.ReviewsCount > 0)
                {
                    organizer.AverageRating =
                        ((organizer.AverageRating * organizer.ReviewsCount) - oldRating + dto.Rating)
                        / organizer.ReviewsCount;

                    _organizerRepo.Update(organizer);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            return new UpdateFeedbackDTO
            {
                FeedbackId = feedback.Id,
                Rating = feedback.Rating,
                Comment = feedback.Comment
            };
        }
        public async Task DeleteAttendeeFeedbackAsync(
                                                int attendeeId,
                                                int eventId)
        {
            var feedback = await _feedbackRepo.GetQueryable()
                .FirstOrDefaultAsync(f =>
                    f.AttendeeId == attendeeId &&
                    f.EventId == eventId &&
                    !f.IsDeleted);

            if (feedback == null)
                throw new KeyNotFoundException("Feedback not found.");

            var ev = await _eventRepo.GetQueryable()
                .FirstOrDefaultAsync(e =>
                    e.Id == eventId &&
                    !e.IsDeleted);

            if (ev == null)
                throw new KeyNotFoundException("Event not found.");

            // Update Event Rating
            if (ev.ReviewsCount > 1)
            {
                ev.AverageRating =
                    ((ev.AverageRating * ev.ReviewsCount) - feedback.Rating)
                    / (ev.ReviewsCount - 1);
            }
            else
            {
                ev.AverageRating = 0;
            }

            ev.ReviewsCount = Math.Max(0, ev.ReviewsCount - 1);

            _eventRepo.Update(ev);

            // Update Organizer Rating
            if (feedback.OrganizerId.HasValue)
            {
                var organizer = await _organizerRepo.GetQueryable()
                    .FirstOrDefaultAsync(o =>
                        o.Id == feedback.OrganizerId &&
                        !o.IsDeleted);

                if (organizer != null)
                {
                    if (organizer.ReviewsCount > 1)
                    {
                        organizer.AverageRating =
                            ((organizer.AverageRating * organizer.ReviewsCount) - feedback.Rating)
                            / (organizer.ReviewsCount - 1);
                    }
                    else
                    {
                        organizer.AverageRating = 0;
                    }

                    organizer.ReviewsCount = Math.Max(0, organizer.ReviewsCount - 1);

                    _organizerRepo.Update(organizer);
                }
            }

            feedback.IsDeleted = true;

            _feedbackRepo.Update(feedback);

            await _unitOfWork.SaveChangesAsync();
        }
        public async Task<UpdateFeedbackDTO> GetMyFeedbackAsync(int attendeeId, int eventId)
        {
            var feedback = await _feedbackRepo.GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(f =>
                    f.AttendeeId == attendeeId &&
                    f.EventId == eventId &&
                    !f.IsDeleted);

            if (feedback == null)
                throw new KeyNotFoundException("Feedback not found.");

            return new UpdateFeedbackDTO
            {
                FeedbackId = feedback.Id,
                Rating = feedback.Rating,
                Comment = feedback.Comment
            };
        }
    }
}
