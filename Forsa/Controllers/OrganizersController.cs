using Application.Core.DTOs.Event;
using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Organizer;
using Application.Core.Interfaces.OrganizerInterfaces;
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

        public OrganizersController(IOrganizerService organizerService)
        {
            _organizerService = organizerService;
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
        public async Task<ActionResult<BookingResponseDto>> SubmitPlaceBookingRequest(int eventId, int placeId, [FromBody] BookingRequestDto dto)
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
    }
}
