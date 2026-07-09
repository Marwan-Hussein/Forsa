using Application.Core.DTOs.Booking;
using Application.Core.Interfaces.OwnerInterfaces;
using Application.Core.Interfaces;
using Application.Core.Interfaces.Auth.OTP;
using Application.Core.DTOs.CommonDTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.BookingEntities;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Application.Core.Helpers;

namespace Application.Services.OwnerServices
{
    public class BookingRequestOwnerService : IBookingRequestOwnerService
    {
        private readonly IQueryableRepository<BookingRequest> _bookingRequestRepo;
        private readonly IQueryableRepository<PlaceAvailability> _availabilityRepo;
        private readonly IPlaceRepository _placeRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;

        public BookingRequestOwnerService(
            IQueryableRepository<BookingRequest> bookingRequestRepo,
            IQueryableRepository<PlaceAvailability> availabilityRepo,
            IPlaceRepository placeRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IEmailService emailService)
        {
            _bookingRequestRepo = bookingRequestRepo;
            _availabilityRepo = availabilityRepo;
            _placeRepo = placeRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
        }

        public async Task<List<BookingRequestDetailsDto>> GetOwnerBookingRequestsAsync(int ownerId)
        {
            var requests = await _bookingRequestRepo.GetQueryable()
                .Include(br => br.Organizer)
                .Include(br => br.Place)
                .Where(br => br.Place.OwnerId == ownerId && !br.IsDeleted)
                .OrderByDescending(br => br.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<BookingRequestDetailsDto>>(requests);
        }

        public async Task<BookingRequestDetailsDto> ProcessOrganizerBookingRequestAsync(
            int ownerId, int requestId, ProcessBookingRequestDto dto)
        {
            // 1. Load the booking request with related data
            var request = await _bookingRequestRepo.GetQueryable()
                .Include(br => br.Organizer)
                .Include(br => br.Place)
                .FirstOrDefaultAsync(br => br.Id == requestId && !br.IsDeleted);

            if (request == null)
                throw new KeyNotFoundException("Booking request not found.");

            // 2. Verify place ownership
            if (request.Place.OwnerId != ownerId)
                throw new UnauthorizedAccessException("You don't own the place for this booking request.");

            // 3. Verify status is Pending (cannot process twice)
            if (request.Status != RequestStatus.Pending)
                throw new InvalidOperationException(
                    $"This request has already been processed. Current status: {request.Status}");

            if (dto.AcceptRequest)
            {
                // ACCEPT
                request.Status = RequestStatus.Accepted;

                // Create a Booked availability entry
                var bookedSlot = new PlaceAvailability
                {
                    Date = request.RequestedDate,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Status = PlaceStatus.Booked,
                    PlaceId = request.PlaceId,
                    CreatedAt = DateTime.UtcNow
                };
                await _availabilityRepo.AddAsync(bookedSlot);

                // Auto reject all other Pending requests on the same place + same date
                var conflictingRequests = await _bookingRequestRepo.GetQueryable()
                    .Include(br => br.Organizer)
                    .Include(br => br.Place)
                    .Where(br =>
                        br.PlaceId == request.PlaceId &&
                        br.RequestedDate.Date == request.RequestedDate.Date &&
                        br.Status == RequestStatus.Pending &&
                        br.Id != requestId &&
                        !br.IsDeleted)
                    .ToListAsync();

                foreach (var conflicting in conflictingRequests)
                {
                    conflicting.Status = RequestStatus.Rejected;
                    conflicting.RejectionReason = "Schedule conflict, date already booked.";
                    conflicting.LastModifiedAt = DateTime.UtcNow;
                    _bookingRequestRepo.Update(conflicting);

                    // email the rejected organizer
                    var conflictTitle = "Booking Request Conflict ⚠️";
                    var conflictBody = $"Hello Organizer!\n\nThank you for requesting to book our venue. Unfortunately, your booking request for the venue **{request.Place.Name}** on **{conflicting.RequestedDate:yyyy-MM-dd}** could not be accepted due to a schedule conflict, as the venue has already been booked for that date. 🗓️\n\nWe apologize for this inconvenience and encourage you to browse alternative dates or other venues on the Forsa platform.";
                    
                    var conflictDetails = new Dictionary<string, string>
                    {
                        { "Venue Name", request.Place.Name },
                        { "Requested Date", conflicting.RequestedDate.ToString("yyyy-MM-dd") },
                        { "Status", "Rejected (Schedule Conflict)" }
                    };

                    var conflictHtml = EmailTemplateHelper.BuildHtmlTemplate(conflictTitle, conflictBody, conflictDetails);
                    var conflictedOrganizerEmail = conflicting.Organizer?.Email;
                    if(conflictedOrganizerEmail is not null)
                    {
                        await _emailService.SendAsync(conflictedOrganizerEmail,
                            "Booking Request Rejected",
                            conflictHtml);
                    }
                }

                // Notify the accepted organizer
                var acceptTitle = "Booking Request Approved! 🎉";
                var acceptBody = $"Congratulations Organizer!\n\nYour request to book **{request.Place.Name}** on **{request.RequestedDate:yyyy-MM-dd}** has been accepted by the venue owner! 🥳\n\nThe venue has been officially reserved for your event. You can access full scheduling and contact information via your dashboard.";
                
                var acceptDetails = new Dictionary<string, string>
                {
                    { "Venue Name", request.Place.Name },
                    { "Requested Date", request.RequestedDate.ToString("yyyy-MM-dd") },
                    { "Booking Status", "Confirmed & Accepted" }
                };

                var acceptHtml = EmailTemplateHelper.BuildHtmlTemplate(acceptTitle, acceptBody, acceptDetails);
                var acceptedOrganizerEmail = request.Organizer?.Email;
                if(acceptedOrganizerEmail is not null)
                {
                    await _emailService.SendAsync(acceptedOrganizerEmail,
                        "Booking Request Accepted",
                        acceptHtml);
                }
            }
            else
            {
                // REJECT
                if (string.IsNullOrWhiteSpace(dto.RejectionReason))
                    throw new InvalidOperationException(
                        "A rejection reason is required when declining a booking request."
                        );

                request.Status = RequestStatus.Rejected;
                request.RejectionReason = dto.RejectionReason;

                // Notify the rejected organizer
                var rejectTitle = "Booking Request Declined ❌";
                var rejectBody = $"Hello Organizer.\n\nWe are writing to let you know that your request to book the venue **{request.Place.Name}** on **{request.RequestedDate:yyyy-MM-dd}** has been declined by the venue owner. 😔\n\nThe owner provided the following feedback for this decision:\n\n**Reason:** {dto.RejectionReason}\n\nWe appreciate your understanding and hope you find another suitable slot or venue on our platform.";
                
                var rejectDetails = new Dictionary<string, string>
                {
                    { "Venue Name", request.Place.Name },
                    { "Requested Date", request.RequestedDate.ToString("yyyy-MM-dd") },
                    { "Status", "Declined" },
                    { "Reason", dto.RejectionReason }
                };

                var rejectHtml = EmailTemplateHelper.BuildHtmlTemplate(rejectTitle, rejectBody, rejectDetails);
                var rejectedOrganizerEmail = request.Organizer?.Email;

                if (!string.IsNullOrWhiteSpace(rejectedOrganizerEmail))
                {
                    try
                    {
                        await _emailService.SendAsync(rejectedOrganizerEmail,
                            "Booking Request Rejected",
                            rejectHtml);
                    }
                    catch
                    {
                        // Silence email failures so owner request processing still succeeds
                    }
                }
            }

            request.LastModifiedAt = DateTime.UtcNow;
            _bookingRequestRepo.Update(request);
            await _unitOfWork.SaveChangesAsync();

            // Send real-time notifications after save changes succeeds
            if (dto.AcceptRequest)
            {
                // Send conflict rejections
                var conflictingRequests = await _bookingRequestRepo.GetQueryable()
                    .Where(br =>
                        br.PlaceId == request.PlaceId &&
                        br.RequestedDate.Date == request.RequestedDate.Date &&
                        br.Status == RequestStatus.Rejected &&
                        br.RejectionReason == "Schedule conflict, date already booked." &&
                        br.Id != requestId &&
                        !br.IsDeleted)
                    .ToListAsync();
            }
            return _mapper.Map<BookingRequestDetailsDto>(request);
        }
    }
}
