using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using AutoMapper;
using Domain.Entities.BookingEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.AttendeeServices
{
    public class AttendeeBookingService : IAttendeeBookingService
    {
        private readonly IQueryableRepository<Booking> _bookingRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IMapper _mapper;

        public AttendeeBookingService(IQueryableRepository<Booking> bookingRepo, IFeedbackRepository feedbackRepo, IMapper mapper)
        {
            _bookingRepo = bookingRepo;
            _feedbackRepo = feedbackRepo;
            _mapper = mapper;
        }

        public async Task<List<AttendeeBookingDto>> GetBookedEventsAsync(int attendeeId)
        {
            // Returns ALL bookings for this attendee (no status filter)
            var bookings = await _bookingRepo.GetQueryable()
                .Include(b => b.Event)
                    .ThenInclude(e => e.Place)
                .Where(b => b.AttendeeId == attendeeId && !b.IsDeleted)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            var dtos = _mapper.Map<List<AttendeeBookingDto>>(bookings);

            var eventIdsWithFeedback = await _feedbackRepo.GetQueryable()
                .Where(f => f.AttendeeId == attendeeId && !f.IsDeleted && f.EventId != null)
                .Select(f => f.EventId.Value)
                .Distinct()
                .ToListAsync();

            foreach (var dto in dtos)
            {
                dto.HasSubmittedFeedback = eventIdsWithFeedback.Contains(dto.EventId);
            }

            return dtos;
        }

        public async Task<List<AttendeeBookingDto>> GetAttendedEventsAsync(int attendeeId)
        {
            // Returns only bookings that were verified as Attended (via QR scan)
            var bookings = await _bookingRepo.GetQueryable()
                .Include(b => b.Event)
                    .ThenInclude(e => e.Place)
                .Where(b => b.AttendeeId == attendeeId && b.Status == BookingStatus.Attended && !b.IsDeleted)
                .OrderByDescending(b => b.Event.EndDate)
                .ToListAsync();

            var dtos = _mapper.Map<List<AttendeeBookingDto>>(bookings);

            var eventIdsWithFeedback = await _feedbackRepo.GetQueryable()
                .Where(f => f.AttendeeId == attendeeId && !f.IsDeleted && f.EventId != null)
                .Select(f => f.EventId.Value)
                .Distinct()
                .ToListAsync();

            foreach (var dto in dtos)
            {
                dto.HasSubmittedFeedback = eventIdsWithFeedback.Contains(dto.EventId);
            }

            return dtos;
        }

        public async Task<List<AttendeeCalendarDto>> GetCalendarAsync(int attendeeId, DateTime? from, DateTime? to)
        {
            // Calendar shows Confirmed + Attended bookings (excludes Cancelled)
            var query = _bookingRepo.GetQueryable()
                .Include(b => b.Event)
                .Where(b => b.AttendeeId == attendeeId &&
                            b.Status != BookingStatus.Cancelled &&
                            !b.IsDeleted);

            if (from.HasValue)
                query = query.Where(b => b.Event.StartDate.Date >= from.Value.Date);
            if (to.HasValue)
                query = query.Where(b => b.Event.StartDate.Date <= to.Value.Date);

            var bookings = await query.ToListAsync();

            var calendar = bookings
                .GroupBy(b => b.Event.StartDate.Date)
                .Select(g => new AttendeeCalendarDto
                {
                    Date = g.Key,
                    Events = g.Select(b => new AttendeeCalendarEventDto
                    {
                        EventId = b.EventId,
                        Title = b.Event.Title,
                        StartDate = b.Event.StartDate,
                        EndDate = b.Event.EndDate,
                        BookingStatus = b.Status.ToString()
                    }).OrderBy(e => e.StartDate).ToList()
                })
                .OrderBy(c => c.Date)
                .ToList();

            return calendar;
        }
    }
}
