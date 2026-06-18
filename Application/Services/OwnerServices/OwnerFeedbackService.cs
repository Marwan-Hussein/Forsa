using Application.Core.DTOs.Owner;
using Application.Core.Interfaces.OwnerInterfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.BookingEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.OwnerServices
{
    public class OwnerFeedbackService : IOwnerFeedbackService
    {
        private readonly IQueryableRepository<BookingRequest> _bookingRequestRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public OwnerFeedbackService(
            IQueryableRepository<BookingRequest> bookingRequestRepo,
            IFeedbackRepository feedbackRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _bookingRequestRepo = bookingRequestRepo;
            _feedbackRepo = feedbackRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<OrganizerFeedbackResponseDto> SubmitOrganizerFeedbackAsync(
            int ownerId, int bookingRequestId, OrganizerFeedbackDto dto)
        {
            // 1. Load BookingRequest with related data
            var request = await _bookingRequestRepo.GetQueryable()
                .Include(br => br.Organizer)
                .Include(br => br.Place)
                .FirstOrDefaultAsync(br => br.Id == bookingRequestId && !br.IsDeleted);

            if (request == null)
                throw new KeyNotFoundException("Booking request not found.");

            // 2. Verify place ownership
            if (request.Place.OwnerId != ownerId)
                throw new UnauthorizedAccessException("You don't own the place for this booking request.");

            // 3. Verify the request was accepted
            if (request.Status != RequestStatus.Accepted)
                throw new InvalidOperationException(
                    "You can only submit feedback for accepted booking requests.");

            // 4. Verify the event date has passed
            if (request.RequestedDate >= DateTime.UtcNow.Date)
                throw new InvalidOperationException(
                    "You can only submit feedback after the event date has passed.");

            // 5. Check for duplicate feedback
            var existingFeedback = await _feedbackRepo.GetQueryable()
                .FirstOrDefaultAsync(f =>
                    f.OwnerId == ownerId &&
                    f.BookingRequestId == bookingRequestId &&
                    !f.IsDeleted);

            if (existingFeedback != null)
                throw new InvalidOperationException(
                    "You have already submitted feedback for this booking request.");

            // 6. Create feedback
            var feedback = new Feedback
            {
                Rating = dto.Rating,
                Comment = dto.Comment,
                OwnerId = ownerId,
                OrganizerId = request.OrganizerId,
                BookingRequestId = bookingRequestId,
                PlaceId = request.PlaceId,
                CreatedAt = DateTime.UtcNow
            };

            await _feedbackRepo.AddAsync(feedback);
            await _unitOfWork.SaveChangesAsync();

            // 7. Return response DTO
            return new OrganizerFeedbackResponseDto
            {
                FeedbackId = feedback.Id,
                Rating = feedback.Rating,
                Comment = feedback.Comment,
                BookingRequestId = bookingRequestId,
                OrganizerId = request.OrganizerId,
                OrganizerName = request.Organizer.FullName,
                CreatedAt = feedback.CreatedAt
            };
        }
    }
}
