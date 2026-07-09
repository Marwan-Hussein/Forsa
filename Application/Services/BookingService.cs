using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
using Application.Core.Interfaces.Auth.OTP;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Core.DTOs.CommonDTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.Entities.PaymentEntities;
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
        private readonly IGoogleCalendarSyncService _calendarSync;
        private readonly IPaymentService _paymentService;
        private readonly IQueryableRepository<PaymentTransaction> _transactionRepository;
        private readonly INotifierService _notifierService;
        private readonly IEmailService _emailService;

        public BookingService(
            IQueryableRepository<Event> eventRepository,
            IQueryableRepository<Booking> bookingRepository,
            IGenericRepository<Notification> notificationRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IQrService qrService,
            IGoogleCalendarSyncService calendarSync,
            IPaymentService paymentService,
            IQueryableRepository<PaymentTransaction> transactionRepository,
            INotifierService notifierService,
            IEmailService emailService)
        {
            _eventRepository = eventRepository;
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _qrService = qrService;
            _calendarSync = calendarSync;
            _paymentService = paymentService;
            _transactionRepository = transactionRepository;
            _emailService = emailService;
        }

        public async Task<EventDetailsDto> GetEventDetailsAsync(int eventId)
        {
            var eventEntity = await _eventRepository.GetQueryable()
                .Include(e => e.Place)
                .Include(e => e.EventMedias)
                .Include(e => e.Organizer)
                    .ThenInclude(o => o.AttendeeSubsOrganizers)
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event no longer available");

            var eventDto = _mapper.Map<EventDetailsDto>(eventEntity);
            eventDto.AvailabilityStatus = eventEntity.RemainingTickets > 0 ? "Available" : "Sold Out";

            return eventDto;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto)
        {

            dto.NumberOfTickets = 1;

            // Get event and validate
            var eventEntity = await _eventRepository.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == dto.EventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event not found");

            if (eventEntity.Status != EventStatus.Published)
                throw new InvalidOperationException("Event is not available for booking");

            // Check if event has already ended
            if (eventEntity.EndDate <= DateTime.UtcNow)
                throw new InvalidOperationException("Event has already ended");

            // Check if enough tickets are available
            if (eventEntity.RemainingTickets < dto.NumberOfTickets)
                throw new InvalidOperationException("Not enough tickets available");

            // Check for duplicate booking
            var existingBooking = await _bookingRepository.GetQueryable()
                .AnyAsync(b => b.AttendeeId == dto.AttendeeId
                          && b.EventId == dto.EventId
                          && (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending));

            if (existingBooking)
                throw new InvalidOperationException("You have already booked this event or have a pending payment.");

            // Create booking
            var booking = new Booking
            {
                AttendeeId = dto.AttendeeId,
                EventId = dto.EventId,
                NumberOfTickets = dto.NumberOfTickets,
                QRCode = Guid.NewGuid().ToString("N"),
                Status = eventEntity.TicketPrice <= 0 ? BookingStatus.Confirmed : BookingStatus.Pending,
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
            #region email booking status
            // send email
            var message = eventEntity.TicketPrice <= 0
                ? $"Your ticket request for '{eventEntity.Title}' has been confirmed! Booking ID: {booking.Id}"
                : $"Your ticket request for '{eventEntity.Title}' has been received and is pending approval. Booking ID: {booking.Id}";
            var attendeeEmail = _bookingRepository.GetQueryable()
                .Where(b => b.Id == booking.Id)
                .Select(b => b.Attendee.Email)
                .FirstOrDefault();

            _emailService.SendAsync(attendeeEmail, "Your Booking Status", message);
            #endregion
            // Save all changes
            await _unitOfWork.SaveChangesAsync();

            // Sync to attendee's Google Calendar (fire-and-forget — won't break booking)
            var googleEventId = await _calendarSync.SyncBookingToCalendarAsync(
                dto.AttendeeId,
                eventEntity.Title,
                eventEntity.Description,
                location: null, // Place is resolved later via booking request
                eventEntity.StartDate,
                eventEntity.EndDate);

            if (!string.IsNullOrWhiteSpace(googleEventId))
            {
                booking.GoogleCalendarEventId = googleEventId;
                _bookingRepository.Update(booking);
                await _unitOfWork.SaveChangesAsync();
            }

            // Map and return response
            return _mapper.Map<BookingResponseDto>(booking);
        }

        public async Task ApproveBookingAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .Include(b => b.Attendee)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            if (booking.Status != BookingStatus.Pending)
                throw new InvalidOperationException("Booking is not pending approval");

            booking.Status = BookingStatus.Confirmed;
            _bookingRepository.Update(booking);

            #region notification
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

            if (!string.IsNullOrWhiteSpace(booking.Attendee?.Email))
            {
                try
                {
                    await _emailService.SendAsync(booking.Attendee.Email,
                        "Booking Approved",
                        notification.Message);
                }
                catch
                {
                    // Silence email failures so booking approval still succeeds
                }
            }

            try
            {
                await _notifierService.SendAsync(booking.AttendeeId, new NotificationMessageDto
                {
                    Title = "Booking Approved",
                    Body = notification.Message,
                    Type = NotificationType.BookingConfirmation.ToString()
                });
            }
            catch
            {
                // Silence real-time notification failures to prevent blocking execution
            }
            #endregion
        }

        public async Task RejectBookingAsync(int bookingId, string reason)
        {
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .Include(b => b.Attendee)
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

            if (!string.IsNullOrWhiteSpace(booking.Attendee?.Email))
            {
                try
                {
                    await _emailService.SendAsync(booking.Attendee.Email,
                        "Booking Rejected",
                        notification.Message);
                }
                catch
                {
                    // Silence email failures so rejection still succeeds
                }
            }

            try
            {
                await _notifierService.SendAsync(booking.AttendeeId, new NotificationMessageDto
                {
                    Title = "Booking Rejected",
                    Body = notification.Message,
                    Type = NotificationType.BookingConfirmation.ToString()
                });
            }
            catch
            {
                // Silence real-time notification failures to prevent blocking execution
            }
        }

        public async Task CancelBookingAsync(int bookingId)
        {
            // Get booking by id
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            // Check if cancellation is allowed (event has not ended yet)
            if (DateTime.UtcNow > booking.Event.EndDate)
                throw new InvalidOperationException("Cannot cancel booking after the event has ended");

            // Cannot cancel if already checked-in/attended
            if (booking.Status == BookingStatus.Attended)
                throw new InvalidOperationException("Cannot cancel booking after attending the event");

            // Check for completed transaction
            var transaction = await _transactionRepository.GetQueryable()
                .FirstOrDefaultAsync(t => t.ReferenceId == bookingId && t.ItemType == "EventBooking" && t.TransactionStatus == TransactionStatus.Completed);

            if (transaction != null)
            {
                // Has paid transaction -> Refund it (ProcessRefundAsync handles booking status and tickets update)
                var refundResult = await _paymentService.ProcessRefundAsync(transaction.PaymentId);
                if (!refundResult.IsSuccess)
                {
                    throw new InvalidOperationException($"Refund failed: {refundResult.Message}");
                }
            }
            else
            {
                // Unpaid/Pending transaction -> just cancel booking
                booking.Status = BookingStatus.Cancelled;
                booking.IsDeleted = true;
                _bookingRepository.Update(booking);

                booking.Event.RemainingTickets += booking.NumberOfTickets;
                _eventRepository.Update(booking.Event);

                var pendingTransaction = await _transactionRepository.GetQueryable()
                    .FirstOrDefaultAsync(t => t.ReferenceId == bookingId && t.ItemType == "EventBooking" && t.TransactionStatus == TransactionStatus.Pending);
                if (pendingTransaction != null)
                {
                    pendingTransaction.TransactionStatus = TransactionStatus.Failed;
                    _transactionRepository.Update(pendingTransaction);
                }
            }

            // Create cancellation notification
            var notification = new Notification
            {
                Type = NotificationType.BookingConfirmation,
                SentVia = DeliveryMethod.Email,
                UserId = booking.AttendeeId,
                Message = $"Your booking for '{booking.Event.Title}' has been cancelled. Booking ID: {booking.Id}",
                Status = NotificationStatus.Pending,
                IsDeleted = false
            };

            await _notificationRepository.AddAsync(notification);

            // Save all changes
            await _unitOfWork.SaveChangesAsync();

            // Remove from attendee's Google Calendar (fire-and-forget)
            await _calendarSync.RemoveBookingFromCalendarAsync(
                booking.AttendeeId,
                booking.GoogleCalendarEventId);
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

        public async Task<byte[]> GetTicketFromQr(int bookingId)
        {
            var bookingInfo = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == bookingId && !b.IsDeleted);
            if (bookingInfo == null)
                throw new KeyNotFoundException("Booking not found");
            var qrPayload = System.Text.Json.JsonSerializer.Serialize(new
            {
                eventId = bookingInfo.EventId,
                token = bookingInfo.QRCode
            });
            byte[] qrImage = _qrService.GenerateQrImage(qrPayload);
            return qrImage;
        }

        public async Task<VerifyAttendanceResponseDto> VerifyAttendanceViaQrCodeAsync(int eventId, string qrCode)
        {
            if (string.IsNullOrWhiteSpace(qrCode))
                throw new ArgumentException("Scanned token cannot be empty.", nameof(qrCode));

            string finalToken = qrCode;

            // Try to parse JSON QR payload (new format: {"eventId":5,"token":"abc123"})
            try
            {
                var jsonDoc = System.Text.Json.JsonDocument.Parse(qrCode);
                if (jsonDoc.RootElement.TryGetProperty("token", out var tokenProp))
                    finalToken = tokenProp.GetString()?.Trim() ?? qrCode;
            }
            catch (System.Text.Json.JsonException)
            {
                // Not JSON so treat as raw token (backward compatibility)
            }

            // Also handle legacy URL format with query params
            if (finalToken.Contains("token="))
            {
                var uri = new Uri(finalToken);
                var queryDictionary = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);
                finalToken = queryDictionary["token"].ToString();
            }

            finalToken = finalToken.Trim();

            var bookingInfo = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .Include(b => b.Attendee)
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
            bookingInfo.CheckedInAt = DateTime.UtcNow;
            _bookingRepository.Update(bookingInfo);

            await _unitOfWork.SaveChangesAsync();

            return new VerifyAttendanceResponseDto
            {
                BookingId = bookingInfo.Id,
                AttendeeId = bookingInfo.AttendeeId,
                AttendeeName = bookingInfo.Attendee?.FullName ?? "Unknown",
                AttendeeEmail = bookingInfo.Attendee?.Email ?? "Unknown",
                EventTitle = bookingInfo.Event?.Title ?? "Unknown",
                NumberOfTickets = bookingInfo.NumberOfTickets,
                Status = bookingInfo.Status.ToString(),
                CheckedInAt = bookingInfo.CheckedInAt.Value
            };
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
