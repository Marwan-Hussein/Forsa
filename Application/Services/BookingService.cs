using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class BookingService : IBookingService
    {
        private readonly IQueryableRepository<Event> _eventRepository;
        private readonly IQueryableRepository<Booking> _bookingRepository;
        private readonly IGenericRepository<Notification> _notificationRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IQrService _qrService;

        public BookingService(
            IQueryableRepository<Event> eventRepository,
            IQueryableRepository<Booking> bookingRepository,
            IGenericRepository<Notification> notificationRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IQrService qrService)
        {
            _eventRepository = eventRepository;
            _bookingRepository = bookingRepository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _qrService = qrService;
        }

        public async Task<EventDetailsDto> GetEventDetailsAsync(int eventId)
        {
            var eventEntity = await _eventRepository.GetQueryable()
                .Include(e => e.Place)
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event no longer available");

            var eventDto = _mapper.Map<EventDetailsDto>(eventEntity);
            eventDto.AvailabilityStatus = eventEntity.RemainingTickets > 0 ? "Available" : "Sold Out";

            return eventDto;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto)
        {
            // Get event and validate
            var eventEntity = await _eventRepository.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == dto.EventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event not found");

            if (eventEntity.Status != EventStatus.Published)
                throw new InvalidOperationException("Event is not available for booking");

            // Check if event has already started
            if (eventEntity.StartDate <= DateTime.UtcNow)
                throw new InvalidOperationException("Event has already started or passed");

            // Check if enough tickets are available
            if (eventEntity.RemainingTickets < dto.NumberOfTickets)
                throw new InvalidOperationException("Not enough tickets available");

            // Check for duplicate booking
            var existingBooking = await _bookingRepository.GetQueryable()
                .AnyAsync(b => b.AttendeeId == dto.AttendeeId 
                          && b.EventId == dto.EventId 
                          && b.Status == BookingStatus.Confirmed);

            if (existingBooking)
                throw new InvalidOperationException("You have already booked this event");

            // Create booking
            var booking = new Booking
            {
                AttendeeId = dto.AttendeeId,
                EventId = dto.EventId,
                NumberOfTickets = dto.NumberOfTickets,
                QRCode = Guid.NewGuid().ToString("N"),
                Status = BookingStatus.Pending,
                BookingDate = DateTime.UtcNow,
                IsDeleted = false,
                SpecialRequests = dto.SpecialRequests,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.AttendeeId.ToString(),
                IsBlocked = false,
            };

            await _bookingRepository.AddAsync(booking);

            // Update event remaining tickets
            eventEntity.RemainingTickets -= dto.NumberOfTickets;
            _eventRepository.Update(eventEntity);

            // Create notification
            var notification = new Notification
            {
                Type = NotificationType.BookingConfirmation,
                SentVia = DeliveryMethod.Email,
                UserId = dto.AttendeeId,
                Message = $"Your ticket request for '{eventEntity.Title}' has been received and is pending approval. Booking ID: {booking.Id}",
                Status = NotificationStatus.Pending,
                IsDeleted = false
            };

            await _notificationRepository.AddAsync(notification);

            // Save all changes
            await _unitOfWork.SaveChangesAsync();

            // Map and return response
            return _mapper.Map<BookingResponseDto>(booking);
        }

        public async Task ApproveBookingAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            if (booking.Status != BookingStatus.Pending)
                throw new InvalidOperationException("Booking is not pending approval");

            booking.Status = BookingStatus.Confirmed;
            _bookingRepository.Update(booking);

            var notification = new Notification
            {
                Type = NotificationType.BookingConfirmation,
                SentVia = DeliveryMethod.Email,
                UserId = booking.AttendeeId,
                Message = $"Your ticket request for '{booking.Event.Title}' has been approved! Booking ID: {booking.Id}",
                Status = NotificationStatus.Pending,
                IsDeleted = false
            };

            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task RejectBookingAsync(int bookingId, string reason)
        {
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            if (booking.Status != BookingStatus.Pending)
                throw new InvalidOperationException("Booking is not pending approval");

            booking.Status = BookingStatus.Rejected;
            booking.RejectionReason = reason;
            _bookingRepository.Update(booking);

            // Restore tickets to event
            booking.Event.RemainingTickets += booking.NumberOfTickets;
            _eventRepository.Update(booking.Event);

            var notification = new Notification
            {
                Type = NotificationType.BookingConfirmation,
                SentVia = DeliveryMethod.Email,
                UserId = booking.AttendeeId,
                Message = $"Your ticket request for '{booking.Event.Title}' has been rejected. Reason: {reason}",
                Status = NotificationStatus.Pending,
                IsDeleted = false
            };

            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task CancelBookingAsync(int bookingId)
        {
            // Get booking by id
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            // Check if cancellation is allowed (24 hours before event)
            var cancellationDeadline = booking.Event.StartDate.AddHours(-24);
            if (DateTime.UtcNow > cancellationDeadline)
                throw new InvalidOperationException("Cannot cancel booking within 24 hours of event start");

            // Update booking status
            booking.Status = BookingStatus.Cancelled;
            booking.IsDeleted = true;
            _bookingRepository.Update(booking);

            // Restore tickets to event
            booking.Event.RemainingTickets += booking.NumberOfTickets;
            _eventRepository.Update(booking.Event);

            // Create cancellation notification
            var notification = new Notification
            {
                Type = NotificationType.BookingConfirmation,
                SentVia = DeliveryMethod.Email,
                UserId = booking.AttendeeId,
                Message = $"Your booking for '{booking.Event.Title}' has been cancelled. Booking ID: {booking.Id}",
                Status =    NotificationStatus.Pending,
                IsDeleted = false
            };

            await _notificationRepository.AddAsync(notification);

            // Save all changes
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<BookingResponseDto> GetBookingAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            return _mapper.Map<BookingResponseDto>(booking);
        }

        public async Task<byte[]> GetTicketFromQr(int bookingId) { 
            var bookingInfo = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);
            if(bookingInfo == null)
                throw new KeyNotFoundException("Booking not found");
            string qrPayload = bookingInfo.QRCode; 
            byte[] qrImage = _qrService.GenerateQrImage(qrPayload);
            return qrImage; 
        }

        public async Task VerifyAttendanceViaQrCodeAsync(int eventId, string qrCode)
        {
            if(string.IsNullOrWhiteSpace(qrCode))
                throw new ArgumentException("Scanned token cannot be empty.", nameof(qrCode));

            string finalToken = qrCode;

            if (qrCode.Contains("token="))
            {
                var uri = new Uri(qrCode);
                var queryDictionary = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);
                finalToken = queryDictionary["token"].ToString();
            }

            finalToken = finalToken.Trim();

            var bookingInfo = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.EventId == eventId && b.QRCode == finalToken && !b.IsDeleted);

            if (bookingInfo == null)
                throw new KeyNotFoundException("Invalid ticket. This QR code does not match any bookings for this event.");

            if (bookingInfo.Status == BookingStatus.Cancelled)
                throw new InvalidOperationException("This booking has been cancelled and cannot be used for attendance.");

            if (bookingInfo.Status == BookingStatus.Pending)
                throw new InvalidOperationException("This ticket is still pending approval. It must be approved before check-in.");

            if (bookingInfo.Status == BookingStatus.Rejected)
                throw new InvalidOperationException("This ticket was rejected and is not valid for entry.");

            if (bookingInfo.Status == BookingStatus.Attended)
                throw new InvalidOperationException("This ticket has already been used for check-in.");

            bookingInfo.Status = BookingStatus.Attended;
            _bookingRepository.Update(bookingInfo);

            await _unitOfWork.SaveChangesAsync();

        }


        public async Task BlockAttendeeFromEventAsync(int eventId, int attendeeId)
        {
            var bookingInfo = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.EventId == eventId && b.AttendeeId == attendeeId && !b.IsDeleted);

            if (bookingInfo == null)
                throw new KeyNotFoundException("The booking information was not found.");
            if (bookingInfo.Status == BookingStatus.Cancelled)
                throw new InvalidOperationException("This attendee's booking is already cancelled.");
            bookingInfo.Status = BookingStatus.Cancelled;
            _bookingRepository.Update(bookingInfo);

            if (bookingInfo.Event != null)
            {
                bookingInfo.Event.RemainingTickets += bookingInfo.NumberOfTickets;
                _eventRepository.Update(bookingInfo.Event); // Explicitly updates the event row capacity count
            }

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
