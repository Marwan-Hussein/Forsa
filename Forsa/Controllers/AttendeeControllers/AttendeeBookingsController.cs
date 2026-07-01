using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces;
using Application.Core.Interfaces.AttendeeInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Forsa.Controllers.AttendeeControllers
{
    [ApiController]
    [Route("api/attendees")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class AttendeeBookingsController : ControllerBase
    {
        private readonly IAttendeeBookingService _bookingService;
        private readonly IPaymentService _paymentService;

        public AttendeeBookingsController(IAttendeeBookingService bookingService, IPaymentService paymentService)
        {
            _bookingService = bookingService;
            _paymentService = paymentService;
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

        // POST: api/attendees/test-refund/{transactionId}
        // Test endpoint for attendee refunds
        [Authorize(Policy = "AttendeeOnly")]
        [HttpPost("test-refund/{transactionId:int}")]
        public async Task<IActionResult> TestRefund(int transactionId)
        {
            try
            {
                var result = await _paymentService.ProcessRefundAsync(transactionId);
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while processing refund: {ex.Message}");
            }
        }
    }
}
