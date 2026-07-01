using Application.Core.DTOs.Event;
using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Organizer;
using Application.Core.Interfaces.OrganizerInterfaces;
using Application.Core.Interfaces;
using Application.Core.DTOs.Payment;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizersController : ControllerBase
    {
        private readonly IOrganizerService _organizerService;
        private readonly Application.Core.Interfaces.EventInterfaces.IEventMediaService _eventMediaService;

        public OrganizersController(
            IOrganizerService organizerService,
            Application.Core.Interfaces.EventInterfaces.IEventMediaService eventMediaService)
        {
            _organizerService = organizerService;
            _eventMediaService = eventMediaService;
        }

        [HttpPost("events")]
        public async Task<ActionResult<EventDetailsDto>> CreateEvent([FromBody] CreateEventDto dto)
        {
            try
            {
                var result = await _organizerService.CreateEventAsync(dto);
                return CreatedAtAction(nameof(CreateEvent), new { id = result.EventId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("events/{eventId}/media")]
        public async Task<ActionResult<List<EventMediaDto>>> UploadEventMedia(
            int eventId, [FromForm] int organizerId, [FromForm] List<IFormFile> files)
        {
            try
            {
                if (files == null || files.Count == 0)
                    return BadRequest("No files uploaded.");

                var mediaDtos = new List<EventMediaUploadDto>();
                foreach (var file in files)
                {
                    mediaDtos.Add(new EventMediaUploadDto { File = file });
                }

                var uploaded = await _eventMediaService.UploadEventMediaAsync(organizerId, eventId, mediaDtos);
                return Ok(uploaded);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("events/{eventId}")]
        public async Task<ActionResult<EventDetailsDto>> UpdateEventDetails(int eventId, [FromBody] UpdateEventDto dto)
        {
            try
            {
                var result = await _organizerService.UpdateEventDetailsAsync(eventId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("events/{eventId}")]
        public async Task<IActionResult> CancelEvent(int eventId)
        {
            try
            {
                await _organizerService.CancelEventAsync(eventId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("events/{eventId}/booking-requests/places/{placeId}")]
        public async Task<ActionResult<BookingRequestDetailsDto>> SubmitPlaceBookingRequest(int eventId, int placeId, [FromBody] BookingRequestDto dto)
        {
            try
            {
                var result = await _organizerService.SubmitPlaceBookingRequestAsync(eventId, placeId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("booking-requests/{requestId}")]
        public async Task<IActionResult> CancelPendingBookingRequest(int requestId)
        {
            try
            {
                await _organizerService.CancelPendingBookingRequestAsync(requestId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/organizers/booking-requests?organizerId=2
        [HttpGet("booking-requests")]
        public async Task<ActionResult<List<BookingRequestDetailsDto>>> GetOrganizerBookingRequests([FromQuery] int organizerId)
        {
            try
            {
                var requests = await _organizerService.GetOrganizerBookingRequestsAsync(organizerId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching booking requests: {ex.Message}");
            }
        }

        [HttpGet("ticket-requests")]
        public async Task<ActionResult<List<TicketRequestDto>>> GetOrganizerTicketRequests([FromQuery] int organizerId)
        {
            try
            {
                var requests = await _organizerService.GetOrganizerTicketRequestsAsync(organizerId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching ticket requests: {ex.Message}");
            }
        }

        // GET: api/organizers/events/dashboard?organizerId=2
        [HttpGet("events/dashboard")]
        public async Task<ActionResult<List<OrganizerEventDashboardDto>>> GetOrganizerEventsDashboard([FromQuery] int organizerId)
        {
            try
            {
                var dashboard = await _organizerService.GetOrganizerEventsDashboardAsync(organizerId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching the dashboard: {ex.Message}");
            }
        }
        // GET: api/organizers/dashboard/stats?organizerId=2
        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<OrganizerDashboardStatsDto>> GetOrganizerDashboardStats([FromQuery] int organizerId)
        {
            try
            {
                var stats = await _organizerService.GetOrganizerDashboardStatsAsync(organizerId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching dashboard stats: {ex.Message}");
            }
        }
        // GET: api/organizers/events/{eventId}/attendees
        [HttpGet("events/{eventId}/attendees")]
        public async Task<ActionResult<List<EventAttendeeDto>>> GetEventAttendees(int eventId)
        {
            try
            {
                var attendees = await _organizerService.GetEventAttendeesAsync(eventId);
                return Ok(attendees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching attendees: {ex.Message}");
            }
        }

        // POST: api/organizers/bookings/{bookingId}/check-in
        [HttpPost("bookings/{bookingId}/check-in")]
        public async Task<ActionResult> ManualCheckIn(int bookingId)
        {
            try
            {
                await _organizerService.ManualCheckInAsync(bookingId);
                return Ok(new { message = "Attendee successfully checked in." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred during check-in: {ex.Message}" });
            }
        }

        // POST: api/organizers/booking-requests/{requestId}/checkout
        [Authorize(Policy = "OrganizerOnly")]
        [HttpPost("booking-requests/{requestId:int}/checkout")]
        public async Task<ActionResult<PaymentResponseDto>> ProcessPlaceCheckout(int requestId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var response = await _checkoutService.ProcessPlaceCheckoutAsync(requestId, userId);
                if (!response.IsSuccess)
                {
                    return BadRequest(response);
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/organizers/payout
        [Authorize(Policy = "OrganizerOnly")]
        [HttpPost("payout")]
        public async Task<ActionResult<PayoutResponseDto>> RequestPayout([FromBody] PayoutRequestDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var response = await _paymentService.InitiateOrganizerPayoutAsync(userId, dto.Amount);
                if (!response.IsSuccess)
                {
                    return BadRequest(response);
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/organizers/payout-method
        [Authorize(Policy = "OrganizerOnly")]
        [HttpPost("payout-method")]
        public async Task<ActionResult> ConfigurePayoutMethod([FromBody] ConfigurePayoutMethodDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var result = await _paymentService.ConfigurePayoutMethodAsync(userId, dto);
                if (!result)
                {
                    return BadRequest(new { message = "Failed to configure payout method." });
                }
                return Ok(new { message = "Payout method configured successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/organizers/refunds/{transactionId}
        [Authorize(Policy = "OrganizerOnly")]
        [HttpPost("refunds/{transactionId:int}")]
        public async Task<IActionResult> ProcessRefund(int transactionId)
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
                return StatusCode(500, new { message = $"An error occurred while processing refund: {ex.Message}" });
        [HttpGet("{organizerId}/profile")]
        public async Task<ActionResult> GetOrganizerProfile(int organizerId)
        {
            try
            {
                var profile = await _organizerService.GetOrganizerProfileAsync(organizerId);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while fetching organizer profile: {ex.Message}" });
            }
        }
    }
}
