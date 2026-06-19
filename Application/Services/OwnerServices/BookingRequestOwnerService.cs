using Application.Core.DTOs.Booking;
using Application.Core.Interfaces.OwnerInterfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.BookingEntities;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.OwnerServices
{
    public class BookingRequestOwnerService : IBookingRequestOwnerService
    {
        private readonly IQueryableRepository<BookingRequest> _bookingRequestRepo;
        private readonly IQueryableRepository<PlaceAvailability> _availabilityRepo;
        private readonly IGenericRepository<Notification> _notificationRepo;
        private readonly IPlaceRepository _placeRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public BookingRequestOwnerService(
            IQueryableRepository<BookingRequest> bookingRequestRepo,
            IQueryableRepository<PlaceAvailability> availabilityRepo,
            IGenericRepository<Notification> notificationRepo,
            IPlaceRepository placeRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _bookingRequestRepo = bookingRequestRepo;
            _availabilityRepo = availabilityRepo;
            _notificationRepo = notificationRepo;
            _placeRepo = placeRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
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

                    // Notify the rejected organizer
                    await _notificationRepo.AddAsync(new Notification
                    {
                        Message = $"Your booking request for \"{request.Place.Name}\" on {conflicting.RequestedDate:yyyy-MM-dd} was rejected due to a schedule conflict.",
                        Type = NotificationType.BookingRequestRejected,
                        SentVia = DeliveryMethod.Email,
                        Status = NotificationStatus.Pending,
                        UserId = conflicting.OrganizerId,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                // Notify the accepted organizer
                await _notificationRepo.AddAsync(new Notification
                {
                    Message = $"Your booking request for \"{request.Place.Name}\" on {request.RequestedDate:yyyy-MM-dd} has been accepted!",
                    Type = NotificationType.BookingRequestAccepted,
                    SentVia = DeliveryMethod.Email,
                    Status = NotificationStatus.Pending,
                    UserId = request.OrganizerId,
                    CreatedAt = DateTime.UtcNow
                });
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
                await _notificationRepo.AddAsync(new Notification
                {
                    Message = $"Your booking request for \"{request.Place.Name}\" on {request.RequestedDate:yyyy-MM-dd} was rejected. Reason: {dto.RejectionReason}",
                    Type = NotificationType.BookingRequestRejected,
                    SentVia = DeliveryMethod.Email,
                    Status = NotificationStatus.Pending,
                    UserId = request.OrganizerId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            request.LastModifiedAt = DateTime.UtcNow;
            _bookingRequestRepo.Update(request);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<BookingRequestDetailsDto>(request);
        }
    }
}
