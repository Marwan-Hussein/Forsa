using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Services.ExternalServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.ExternalControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoogleCalendarController : ControllerBase
    {
        private readonly IGoogleCalendarService _googleCalendarService;
        private readonly ILogger<GoogleCalendarController> _logger;
        public GoogleCalendarController(IGoogleCalendarService googleCalendarService, ILogger<GoogleCalendarController> logger)
        {
            _googleCalendarService = googleCalendarService;
            _logger = logger;
        }

        // get the event from google calender with id={id}
        [HttpGet("{eventId}")]
        public async Task<IActionResult> GetEvent(string eventId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return BadRequest("Event ID cannot be empty.");

            try
            {
                var googleEvent = await _googleCalendarService.GetEventAsync(eventId, cancellationToken);

                if (googleEvent == null)
                {
                    _logger.LogWarning("Google Calendar event with ID {EventId} not found.", eventId);
                    return NotFound($"Google Calendar event with ID '{eventId}' was not found.");
                }

                return Ok(googleEvent);
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
                var createdEventId = await _googleCalendarService.CreateEventAsync(eventDto, cancellationToken);
                return CreatedAtAction(nameof(GetEvent), new { eventId = createdEventId }, createdEventId);
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
                await _googleCalendarService.UpdateEventAsync(eventId, eventDto, cancellationToken);
                return Ok(new { message = $"Event '{eventId}' updated successfully." });
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
                await _googleCalendarService.DeleteEventAsync(eventId, cancellationToken);
                return NoContent();
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
