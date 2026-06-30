using Application.Core.DTOs.ExternalDTOs;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    /// <summary>
    /// A high-level sync service that automatically pushes system events
    /// to a user's Google Calendar if they have connected their account.
    /// All methods are fire-and-forget safe — failures are logged but never
    /// propagate to the caller.
    /// </summary>
    public interface IGoogleCalendarSyncService
    {
        // ── Attendee: booking creates/cancels a personal calendar event ──

        /// <summary>
        /// Creates a Google Calendar event for the attendee when they book an event.
        /// Returns the Google Calendar event ID (or null if the user is not connected).
        /// </summary>
        Task<string?> SyncBookingToCalendarAsync(int attendeeUserId, string eventTitle, string? eventDescription, string? location, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

        /// <summary>
        /// Deletes the Google Calendar event for the attendee when they cancel a booking.
        /// </summary>
        Task RemoveBookingFromCalendarAsync(int attendeeUserId, string? googleCalendarEventId, CancellationToken cancellationToken = default);

        // ── Organizer: event CRUD syncs to organizer's personal calendar ──

        /// <summary>
        /// Creates a Google Calendar event for the organizer when they create an event.
        /// Returns the Google Calendar event ID (or null if the user is not connected).
        /// </summary>
        Task<string?> SyncOrganizerEventToCalendarAsync(int organizerUserId, string eventTitle, string? eventDescription, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

        /// <summary>
        /// Updates the Google Calendar event for the organizer when they update their event.
        /// </summary>
        Task UpdateOrganizerEventInCalendarAsync(int organizerUserId, string? googleCalendarEventId, string eventTitle, string? eventDescription, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

        /// <summary>
        /// Deletes the Google Calendar event for the organizer when they cancel their event.
        /// </summary>
        Task RemoveOrganizerEventFromCalendarAsync(int organizerUserId, string? googleCalendarEventId, CancellationToken cancellationToken = default);

        // ── Owner: occupied/blocked days sync to owner's personal calendar ──

        /// <summary>
        /// Creates a Google Calendar event for the owner when they block/occupy a day.
        /// Returns the Google Calendar event ID (or null if the user is not connected).
        /// </summary>
        Task<string?> SyncOwnerAvailabilityToCalendarAsync(int ownerUserId, string placeName, DateTime date, TimeSpan? startTime, TimeSpan? endTime, string status, CancellationToken cancellationToken = default);

        /// <summary>
        /// Updates the Google Calendar event for the owner when they change availability.
        /// </summary>
        Task UpdateOwnerAvailabilityInCalendarAsync(int ownerUserId, string? googleCalendarEventId, string placeName, DateTime date, TimeSpan? startTime, TimeSpan? endTime, string status, CancellationToken cancellationToken = default);

        /// <summary>
        /// Deletes the Google Calendar event for the owner when they remove an availability slot.
        /// </summary>
        Task RemoveOwnerAvailabilityFromCalendarAsync(int ownerUserId, string? googleCalendarEventId, CancellationToken cancellationToken = default);
    }
}
