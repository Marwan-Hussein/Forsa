using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AttendeeControllers
{
    [ApiController]
    [Route("api/attendees")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class AttendeeBookingsController : ControllerBase
    {
        private readonly IAttendeeBookingService _bookingService;

        public AttendeeBookingsController(IAttendeeBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET: api/attendees/{attendeeId}/bookings
        // Returns ALL bookings for this attendee (Confirmed, Cancelled, Attended)
        [Authorize(Policy = "AttendeeOnly")]
        [HttpGet("{attendeeId:int}/bookings")]
        public async Task<ActionResult<List<AttendeeBookingDto>>> GetBookedEvents(int attendeeId)
        {
            try
            {
                var bookings = await _bookingService.GetBookedEventsAsync(attendeeId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching booked events: {ex.Message}");
            }
        }

        // GET: api/attendees/{attendeeId}/bookings/attended
        // Returns only events where QR was scanned and attendance verified
        [Authorize(Policy = "AttendeeOnly")]
        [HttpGet("{attendeeId:int}/bookings/attended")]
        public async Task<ActionResult<List<AttendeeBookingDto>>> GetAttendedEvents(int attendeeId)
        {
            try
            {
                var bookings = await _bookingService.GetAttendedEventsAsync(attendeeId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching attended events: {ex.Message}");
            }
        }

        // GET: api/attendees/{attendeeId}/calendar?from=2026-07-01&to=2026-07-31
        // Returns calendar view of active bookings grouped by date
        [Authorize(Policy = "AttendeeOnly")]
        [HttpGet("{attendeeId:int}/calendar")]
        public async Task<ActionResult<List<AttendeeCalendarDto>>> GetCalendar(int attendeeId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var calendar = await _bookingService.GetCalendarAsync(attendeeId, from, to);
                return Ok(calendar);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching the calendar: {ex.Message}");
            }
        }
    }
}
