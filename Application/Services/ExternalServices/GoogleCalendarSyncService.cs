using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Domain.Entities.AuthEntities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Services.ExternalServices
{
    public class GoogleCalendarSyncService : IGoogleCalendarSyncService
    {
        private readonly IGoogleCalendarService _calendarService;
        private readonly IQueryableRepository<UserGoogleToken> _tokenRepository;
        private readonly ILogger<GoogleCalendarSyncService> _logger;

        public GoogleCalendarSyncService(
            IGoogleCalendarService calendarService,
            IQueryableRepository<UserGoogleToken> tokenRepository,
            ILogger<GoogleCalendarSyncService> logger)
        {
            _calendarService = calendarService;
            _tokenRepository = tokenRepository;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves the Google email (calendarId) for a user if they have connected Google Calendar.
        /// Returns null if the user has not connected — the caller should then skip sync.
        /// </summary>
        private async Task<string?> GetGoogleEmailForUserAsync(int userId, CancellationToken cancellationToken)
        {
            var token = await _tokenRepository.GetQueryable()
                .FirstOrDefaultAsync(t => t.UserId == userId, cancellationToken);

            return token?.GoogleEmail;
        }

        // ═══════════════════════════════════════════════════════════════
        //  ATTENDEE  —  Booking → Google Calendar
        // ═══════════════════════════════════════════════════════════════

        public async Task<string?> SyncBookingToCalendarAsync(
            int attendeeUserId, string eventTitle, string? eventDescription,
            string? location, DateTime startDate, DateTime endDate,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(attendeeUserId, cancellationToken);
                if (calendarId == null)
                {
                    _logger.LogDebug("Attendee {UserId} has not connected Google Calendar. Skipping sync.", attendeeUserId);
                    return null;
                }

                var dto = new GoogleCalendarEventDto
                {
                    Title = $"📅 {eventTitle}",
                    Description = eventDescription ?? $"You booked tickets for '{eventTitle}' via Forsa.",
                    Location = location,
                    StartTime = startDate,
                    EndTime = endDate
                };

                var googleEventId = await _calendarService.CreateEventAsync(calendarId, dto, cancellationToken);
                _logger.LogInformation("Created Google Calendar event {GoogleEventId} for attendee {UserId} booking '{Title}'.", googleEventId, attendeeUserId, eventTitle);
                return googleEventId;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to sync booking to Google Calendar for attendee {UserId}. This will not affect the booking.", attendeeUserId);
                return null;
            }
        }

        public async Task RemoveBookingFromCalendarAsync(
            int attendeeUserId, string? googleCalendarEventId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleCalendarEventId)) return;

            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(attendeeUserId, cancellationToken);
                if (calendarId == null) return;

                await _calendarService.DeleteEventAsync(calendarId, googleCalendarEventId, cancellationToken);
                _logger.LogInformation("Removed Google Calendar event {GoogleEventId} for attendee {UserId}.", googleCalendarEventId, attendeeUserId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to remove Google Calendar event {GoogleEventId} for attendee {UserId}.", googleCalendarEventId, attendeeUserId);
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ORGANIZER  —  Event CRUD → Google Calendar
        // ═══════════════════════════════════════════════════════════════

        public async Task<string?> SyncOrganizerEventToCalendarAsync(
            int organizerUserId, string eventTitle, string? eventDescription,
            DateTime startDate, DateTime endDate,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(organizerUserId, cancellationToken);
                if (calendarId == null)
                {
                    _logger.LogDebug("Organizer {UserId} has not connected Google Calendar. Skipping sync.", organizerUserId);
                    return null;
                }

                var dto = new GoogleCalendarEventDto
                {
                    Title = $"🎪 [Organizer] {eventTitle}",
                    Description = eventDescription ?? $"Your event '{eventTitle}' on Forsa.",
                    StartTime = startDate,
                    EndTime = endDate
                };

                var googleEventId = await _calendarService.CreateEventAsync(calendarId, dto, cancellationToken);
                _logger.LogInformation("Created Google Calendar event {GoogleEventId} for organizer {UserId} event '{Title}'.", googleEventId, organizerUserId, eventTitle);
                return googleEventId;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to sync event to Google Calendar for organizer {UserId}. This will not affect the event.", organizerUserId);
                return null;
            }
        }

        public async Task UpdateOrganizerEventInCalendarAsync(
            int organizerUserId, string? googleCalendarEventId,
            string eventTitle, string? eventDescription,
            DateTime startDate, DateTime endDate,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleCalendarEventId)) return;

            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(organizerUserId, cancellationToken);
                if (calendarId == null) return;

                var dto = new GoogleCalendarEventDto
                {
                    Title = $"🎪 [Organizer] {eventTitle}",
                    Description = eventDescription ?? $"Your event '{eventTitle}' on Forsa.",
                    StartTime = startDate,
                    EndTime = endDate
                };

                await _calendarService.UpdateEventAsync(calendarId, googleCalendarEventId, dto, cancellationToken);
                _logger.LogInformation("Updated Google Calendar event {GoogleEventId} for organizer {UserId}.", googleCalendarEventId, organizerUserId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update Google Calendar event {GoogleEventId} for organizer {UserId}.", googleCalendarEventId, organizerUserId);
            }
        }

        public async Task RemoveOrganizerEventFromCalendarAsync(
            int organizerUserId, string? googleCalendarEventId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleCalendarEventId)) return;

            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(organizerUserId, cancellationToken);
                if (calendarId == null) return;

                await _calendarService.DeleteEventAsync(calendarId, googleCalendarEventId, cancellationToken);
                _logger.LogInformation("Removed Google Calendar event {GoogleEventId} for organizer {UserId}.", googleCalendarEventId, organizerUserId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to remove Google Calendar event {GoogleEventId} for organizer {UserId}.", googleCalendarEventId, organizerUserId);
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  OWNER  —  Availability/Blocked days → Google Calendar
        // ═══════════════════════════════════════════════════════════════

        public async Task<string?> SyncOwnerAvailabilityToCalendarAsync(
            int ownerUserId, string placeName, DateTime date,
            TimeSpan? startTime, TimeSpan? endTime, string status,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(ownerUserId, cancellationToken);
                if (calendarId == null)
                {
                    _logger.LogDebug("Owner {UserId} has not connected Google Calendar. Skipping sync.", ownerUserId);
                    return null;
                }

                var (start, end) = ResolveAvailabilityTimes(date, startTime, endTime);

                var dto = new GoogleCalendarEventDto
                {
                    Title = $"🏢 [{status}] {placeName}",
                    Description = $"Place '{placeName}' is marked as {status} on Forsa.",
                    StartTime = start,
                    EndTime = end
                };

                var googleEventId = await _calendarService.CreateEventAsync(calendarId, dto, cancellationToken);
                _logger.LogInformation("Created Google Calendar event {GoogleEventId} for owner {UserId} place '{PlaceName}' on {Date}.", googleEventId, ownerUserId, placeName, date);
                return googleEventId;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to sync availability to Google Calendar for owner {UserId}.", ownerUserId);
                return null;
            }
        }

        public async Task UpdateOwnerAvailabilityInCalendarAsync(
            int ownerUserId, string? googleCalendarEventId,
            string placeName, DateTime date,
            TimeSpan? startTime, TimeSpan? endTime, string status,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleCalendarEventId)) return;

            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(ownerUserId, cancellationToken);
                if (calendarId == null) return;

                var (start, end) = ResolveAvailabilityTimes(date, startTime, endTime);

                var dto = new GoogleCalendarEventDto
                {
                    Title = $"🏢 [{status}] {placeName}",
                    Description = $"Place '{placeName}' is marked as {status} on Forsa.",
                    StartTime = start,
                    EndTime = end
                };

                await _calendarService.UpdateEventAsync(calendarId, googleCalendarEventId, dto, cancellationToken);
                _logger.LogInformation("Updated Google Calendar event {GoogleEventId} for owner {UserId}.", googleCalendarEventId, ownerUserId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update Google Calendar event {GoogleEventId} for owner {UserId}.", googleCalendarEventId, ownerUserId);
            }
        }

        public async Task RemoveOwnerAvailabilityFromCalendarAsync(
            int ownerUserId, string? googleCalendarEventId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(googleCalendarEventId)) return;

            try
            {
                var calendarId = await GetGoogleEmailForUserAsync(ownerUserId, cancellationToken);
                if (calendarId == null) return;

                await _calendarService.DeleteEventAsync(calendarId, googleCalendarEventId, cancellationToken);
                _logger.LogInformation("Removed Google Calendar event {GoogleEventId} for owner {UserId}.", googleCalendarEventId, ownerUserId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to remove Google Calendar event {GoogleEventId} for owner {UserId}.", googleCalendarEventId, ownerUserId);
            }
        }

        // ── Helper ──

        private static (DateTime start, DateTime end) ResolveAvailabilityTimes(
            DateTime date, TimeSpan? startTime, TimeSpan? endTime)
        {
            // If startTime/endTime are null → full-day event (00:00 → 23:59)
            var start = date.Date + (startTime ?? TimeSpan.Zero);
            var end = date.Date + (endTime ?? new TimeSpan(23, 59, 0));

            // Safety: ensure end is after start
            if (end <= start) end = start.AddHours(1);

            return (start, end);
        }
    }
}
