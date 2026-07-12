using Application.Core.DTOs.Place;
using Application.Core.Interfaces.OwnerInterfaces;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using AutoMapper;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.OwnerServices
{
    public class PlaceAvailabilityService : IPlaceAvailabilityService
    {
        private readonly IPlaceRepository _placeRepo;
        private readonly IQueryableRepository<PlaceAvailability> _availabilityRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGoogleCalendarSyncService _calendarSync;
        private readonly IQueryableRepository<Domain.Entities.BookingEntities.BookingRequest> _bookingRequestRepo;

        public PlaceAvailabilityService(
            IPlaceRepository placeRepo,
            IQueryableRepository<PlaceAvailability> availabilityRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IGoogleCalendarSyncService calendarSync,
            IQueryableRepository<Domain.Entities.BookingEntities.BookingRequest> bookingRequestRepo)
        {
            _placeRepo = placeRepo;
            _availabilityRepo = availabilityRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _calendarSync = calendarSync;
            _bookingRequestRepo = bookingRequestRepo;
        }

        public async Task<PlaceAvailabilityDto> UpdatePlaceAvailabilityCalendarAsync(
            int ownerId, int placeId, CalendarUpdateDto dto)
        {
            // 1. Verify place ownership
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);
            if (place == null)
                throw new KeyNotFoundException("Place not found or you don't own this place.");

            // 2. Only allow Available (4) or Blocked (6) — Booked (5) is set by booking acceptance
            var status = (PlaceStatus)dto.Status;
            if (status != PlaceStatus.Available && status != PlaceStatus.Blocked)
                throw new InvalidOperationException(
                    "You can only set slots as Available (4) or Blocked (6). Booked status is set automatically when a booking is accepted.");

            // 3. Check for conflicting existing slot on the same date
            var conflict = await _availabilityRepo.GetQueryable()
                .FirstOrDefaultAsync(a =>
                    a.PlaceId == placeId &&
                    a.Date.Date == dto.Date.Date &&
                    !a.IsDeleted);

            if (conflict != null)
            {
                // If a slot already exists for this date, update it instead of creating a duplicate
                conflict.StartTime = dto.StartTime ?? new TimeSpan(9, 0, 0);
                conflict.EndTime = dto.EndTime ?? new TimeSpan(21, 0, 0);
                conflict.Status = status;
                conflict.LastModifiedAt = DateTime.UtcNow;
                _availabilityRepo.Update(conflict);
                await _unitOfWork.SaveChangesAsync();

                // Sync update to owner's Google Calendar (fire-and-forget)
                if (!string.IsNullOrWhiteSpace(conflict.GoogleCalendarEventId))
                {
                    await _calendarSync.UpdateOwnerAvailabilityInCalendarAsync(
                        ownerId, conflict.GoogleCalendarEventId,
                        place.Name, dto.Date, conflict.StartTime, conflict.EndTime, status.ToString());
                }
                else
                {
                    var gcEventId = await _calendarSync.SyncOwnerAvailabilityToCalendarAsync(
                        ownerId, place.Name, dto.Date, conflict.StartTime, conflict.EndTime, status.ToString());
                    if (!string.IsNullOrWhiteSpace(gcEventId))
                    {
                        conflict.GoogleCalendarEventId = gcEventId;
                        _availabilityRepo.Update(conflict);
                        await _unitOfWork.SaveChangesAsync();
                    }
                }

                return _mapper.Map<PlaceAvailabilityDto>(conflict);
            }

            // 4. Create new availability slot
            var slot = new PlaceAvailability
            {
                Date = dto.Date.Date,
                StartTime = dto.StartTime ?? new TimeSpan(9, 0, 0),
                EndTime = dto.EndTime ?? new TimeSpan(21, 0, 0),
                Status = status,
                PlaceId = placeId,
                CreatedAt = DateTime.UtcNow
            };

            await _availabilityRepo.AddAsync(slot);
            await _unitOfWork.SaveChangesAsync();

            // Sync to owner's Google Calendar (fire-and-forget)
            var googleEventId = await _calendarSync.SyncOwnerAvailabilityToCalendarAsync(
                ownerId, place.Name, dto.Date, dto.StartTime, dto.EndTime, status.ToString());

            if (!string.IsNullOrWhiteSpace(googleEventId))
            {
                slot.GoogleCalendarEventId = googleEventId;
                _availabilityRepo.Update(slot);
                await _unitOfWork.SaveChangesAsync();
            }

            return _mapper.Map<PlaceAvailabilityDto>(slot);
        }

        public async Task<List<PlaceAvailabilityDto>> GetPlaceCalendarAsync(
            int ownerId, int placeId, DateTime? fromDate, DateTime? toDate)
        {
            // 1. Verify place ownership
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);
            if (place == null)
                throw new KeyNotFoundException("Place not found or you don't own this place.");

            // 2. Query all slots (including Booked so the owner can see everything)
            var query = _availabilityRepo.GetQueryable()
                .Where(a => a.PlaceId == placeId && !a.IsDeleted);

            // 3. Optional date range filter
            if (fromDate.HasValue)
                query = query.Where(a => a.Date >= fromDate.Value.Date);
            if (toDate.HasValue)
                query = query.Where(a => a.Date <= toDate.Value.Date);

            var slots = await query.OrderBy(a => a.Date)
                                   .ThenBy(a => a.StartTime)
                                   .ToListAsync();

            // Fetch accepted booking requests with events for this place
            var bookingRequests = await _bookingRequestRepo.GetQueryable()
                .Include(r => r.Event)
                .Where(r => r.PlaceId == placeId && r.Status == Domain.ENUMs.RequestStatus.Accepted && !r.IsDeleted)
                .ToListAsync();

            var dtos = new List<PlaceAvailabilityDto>();
            foreach (var a in slots)
            {
                var isCompletedEvent = false;
                if (a.Status == PlaceStatus.Booked)
                {
                    var matchingRequest = bookingRequests.FirstOrDefault(r => r.RequestedDate.Date == a.Date.Date);
                    if (matchingRequest?.Event != null)
                    {
                        isCompletedEvent = matchingRequest.Event.Status == EventStatus.Completed || matchingRequest.Event.EndDate <= DateTime.UtcNow;
                    }
                }
                
                if (!isCompletedEvent)
                {
                    dtos.Add(_mapper.Map<PlaceAvailabilityDto>(a));
                }
            }

            return dtos;
        }

        public async Task<bool> RemoveAvailabilitySlotAsync(int ownerId, int placeId, int slotId)
        {
            // 1. Verify place ownership
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);
            if (place == null)
                throw new KeyNotFoundException("Place not found or you don't own this place.");

            // 2. Find the slot
            var slot = await _availabilityRepo.GetQueryable()
                .FirstOrDefaultAsync(a => a.Id == slotId && a.PlaceId == placeId && !a.IsDeleted);
            if (slot == null) return false;

            // 3. Only allow removing Available or Blocked — NOT active Booked
            if (slot.Status == PlaceStatus.Booked)
            {
                var matchingRequest = await _bookingRequestRepo.GetQueryable()
                    .Include(r => r.Event)
                    .FirstOrDefaultAsync(r => r.PlaceId == placeId && r.RequestedDate.Date == slot.Date.Date && r.Status == Domain.ENUMs.RequestStatus.Accepted && !r.IsDeleted);
                
                var isCompletedEvent = matchingRequest?.Event != null && 
                                       (matchingRequest.Event.Status == EventStatus.Completed || matchingRequest.Event.EndDate <= DateTime.UtcNow);

                if (!isCompletedEvent)
                {
                    throw new InvalidOperationException(
                        "Cannot remove an active Booked slot. Cancel the booking first.");
                }
            }

            // 4. Soft-delete
            slot.IsDeleted = true;
            slot.DeletedAt = DateTime.UtcNow;
            _availabilityRepo.Update(slot);
            await _unitOfWork.SaveChangesAsync();

            // Remove from owner's Google Calendar (fire-and-forget)
            await _calendarSync.RemoveOwnerAvailabilityFromCalendarAsync(
                ownerId, slot.GoogleCalendarEventId);

            return true;
        }
    }
}
