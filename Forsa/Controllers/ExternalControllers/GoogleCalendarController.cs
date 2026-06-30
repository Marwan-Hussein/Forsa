using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Services.ExternalServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forsa.Controllers.ExternalControllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GoogleCalendarController : ControllerBase
    {
        private readonly IGoogleCalendarService _googleCalendarService;
        private readonly ILogger<GoogleCalendarController> _logger;
        public GoogleCalendarController(IGoogleCalendarService googleCalendarService, ILogger<GoogleCalendarController> logger)
        {
            _googleCalendarService = googleCalendarService;
            _logger = logger;
        }

        // Extracts the logged-in user's email from the JWT token to use as the CalendarId
        private string GetUserCalendarId()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(email))
                throw new UnauthorizedAccessException("User email claim is missing from the token.");
            return email;
        }

        // get the event from google calender with id={id}
        [HttpGet("{eventId}")]
        public async Task<IActionResult> GetEvent(string eventId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return BadRequest("Event ID cannot be empty.");

            try
            {
                var calendarId = GetUserCalendarId();
                var googleEvent = await _googleCalendarService.GetEventAsync(calendarId, eventId, cancellationToken);

                if (googleEvent == null)
                {
                    _logger.LogWarning("Google Calendar event with ID {EventId} not found.", eventId);
                    return NotFound($"Google Calendar event with ID '{eventId}' was not found.");
                }

                return Ok(googleEvent);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (ExternalServiceException ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving event {EventId}", eventId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal error occurred." });
            }
        }

        // set an event in GC from Forsa
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] GoogleCalendarEventDto eventDto, CancellationToken cancellationToken)
        {
            if (eventDto == null)
                return BadRequest("Event data cannot be null.");

            if (eventDto.StartTime >= eventDto.EndTime)
                return BadRequest("Start time must be strictly before end time.");

            try
            {
                var calendarId = GetUserCalendarId();
                var createdEventId = await _googleCalendarService.CreateEventAsync(calendarId, eventDto, cancellationToken);
                return CreatedAtAction(nameof(GetEvent), new { eventId = createdEventId }, createdEventId);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ExternalServiceException ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating event: {Title}", eventDto.Title);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal error occurred." });
            }
        }

        // update event in GC with id={id}
        [HttpPut("{eventId}")]
        public async Task<IActionResult> UpdateEvent(string eventId, [FromBody] GoogleCalendarEventDto eventDto, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return BadRequest("Event ID cannot be empty.");

            if (eventDto == null)
                return BadRequest("Update payload cannot be null.");

            if (eventDto.StartTime >= eventDto.EndTime)
                return BadRequest("Start time must be strictly before end time.");

            try
            {
                var calendarId = GetUserCalendarId();
                await _googleCalendarService.UpdateEventAsync(calendarId, eventId, eventDto, cancellationToken);
                return Ok(new { message = $"Event '{eventId}' updated successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ExternalServiceException ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error updating event {EventId}", eventId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal error occurred." });
            }
        }

        // delete event in GC with id={id}
        [HttpDelete("{eventId}")]
        public async Task<IActionResult> DeleteEvent(string eventId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return BadRequest("Event ID cannot be empty.");

            try
            {
                var calendarId = GetUserCalendarId();
                await _googleCalendarService.DeleteEventAsync(calendarId, eventId, cancellationToken);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (ExternalServiceException ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting event {EventId}", eventId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal error occurred." });
            }
        }
    }
}
