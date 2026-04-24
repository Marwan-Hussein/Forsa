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

        public BookingService(
            IQueryableRepository<Event> eventRepository,
            IQueryableRepository<Booking> bookingRepository,
            IGenericRepository<Notification> notificationRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _eventRepository = eventRepository;
            _bookingRepository = bookingRepository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<EventDetailsDto> GetEventDetailsAsync(int eventId)
        {
            var eventEntity = await _eventRepository.GetQueryable()
                .FirstOrDefaultAsync(e => e.EventId == eventId && !e.IsDeleted);

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
                .FirstOrDefaultAsync(e => e.EventId == dto.EventId && !e.IsDeleted);

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
                Status = BookingStatus.Confirmed,
                BookingDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _bookingRepository.Add(booking);

            // Update event remaining tickets
            eventEntity.RemainingTickets -= dto.NumberOfTickets;
            _eventRepository.Update(eventEntity);

            // Create notification
            var notification = new Notification
            {
                Type = "BookingConfirmation",
                SentVia = "Email",
                UserId = dto.AttendeeId,
                Message = $"Your booking for '{eventEntity.Title}' has been confirmed. Booking ID: {booking.BookingId}",
                Status = "Pending",
                IsDeleted = false
            };

            _notificationRepository.Add(notification);

            // Save all changes
            await _unitOfWork.SaveChangesAsync();

            // Map and return response
            return _mapper.Map<BookingResponseDto>(booking);
        }

        public async Task CancelBookingAsync(int bookingId)
        {
            // Get booking by id
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            // Check if cancellation is allowed (24 hours before event)
            var cancellationDeadline = booking.Event.StartDate.AddHours(-24);
            if (DateTime.UtcNow > cancellationDeadline)
                throw new InvalidOperationException("Cannot cancel booking within 24 hours of event start");

            // Update booking status
            booking.Status = BookingStatus.Cancelled;
            _bookingRepository.Update(booking);

            // Restore tickets to event
            booking.Event.RemainingTickets += booking.NumberOfTickets;
            _eventRepository.Update(booking.Event);

            // Create cancellation notification
            var notification = new Notification
            {
                Type = "BookingCancellation",
                SentVia = "Email",
                UserId = booking.AttendeeId,
                Message = $"Your booking for '{booking.Event.Title}' has been cancelled. Booking ID: {booking.BookingId}",
                Status = "Pending",
                IsDeleted = false
            };

            _notificationRepository.Add(notification);

            // Save all changes
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<BookingResponseDto> GetBookingAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetQueryable()
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId && !b.IsDeleted);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            return _mapper.Map<BookingResponseDto>(booking);
        }
    }
}
