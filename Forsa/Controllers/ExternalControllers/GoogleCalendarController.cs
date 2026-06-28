using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Services.ExternalServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Forsa.Controllers.ExternalControllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GoogleCalendarController : ControllerBase
    {
        private readonly IGoogleCalendarService _googleCalendarService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly ILogger<GoogleCalendarController> _logger;

        public GoogleCalendarController(
            IGoogleCalendarService googleCalendarService,
            IGoogleAuthService googleAuthService,
            ILogger<GoogleCalendarController> _logger)
        {
            _googleCalendarService = googleCalendarService;
            _googleAuthService = googleAuthService;
            this._logger = _logger;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                throw new UnauthorizedAccessException("User identification claim is missing or invalid in the token.");
            return userId;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetConnectionStatus(CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserId();
                var isConnected = await _googleAuthService.IsConnectedAsync(userId, cancellationToken);
                return Ok(new { isConnected });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving connection status");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal error occurred." });
            }
        }

        // get the event from google calendar with id={eventId}
        [HttpGet("{eventId}")]
        public async Task<IActionResult> GetEvent(string eventId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return BadRequest("Event ID cannot be empty.");

            try
            {
                var userId = GetUserId();
                var accessToken = await _googleAuthService.GetOrRefreshTokenAsync(userId, cancellationToken);
                var googleEvent = await _googleCalendarService.GetEventAsync(accessToken, eventId, cancellationToken);

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
            catch (InvalidOperationException ex) when (ex.Message.Contains("not integrated") || ex.Message.Contains("needs to be reconnected"))
            {
                return BadRequest(new { message = ex.Message, code = "GOOGLE_CALENDAR_DISCONNECTED" });
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

        // set an event in Google Calendar from Forsa
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] GoogleCalendarEventDto eventDto, CancellationToken cancellationToken)
        {
            if (eventDto == null)
                return BadRequest("Event data cannot be null.");

            if (eventDto.StartTime >= eventDto.EndTime)
                return BadRequest("Start time must be strictly before end time.");

            try
            {
                var userId = GetUserId();
                var accessToken = await _googleAuthService.GetOrRefreshTokenAsync(userId, cancellationToken);
                var createdEventId = await _googleCalendarService.CreateEventAsync(accessToken, eventDto, cancellationToken);
                return CreatedAtAction(nameof(GetEvent), new { eventId = createdEventId }, createdEventId);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not integrated") || ex.Message.Contains("needs to be reconnected"))
            {
                return BadRequest(new { message = ex.Message, code = "GOOGLE_CALENDAR_DISCONNECTED" });
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

        // update event in Google Calendar with id={eventId}
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
                var userId = GetUserId();
                var accessToken = await _googleAuthService.GetOrRefreshTokenAsync(userId, cancellationToken);
                await _googleCalendarService.UpdateEventAsync(accessToken, eventId, eventDto, cancellationToken);
                return Ok(new { message = $"Event '{eventId}' updated successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not integrated") || ex.Message.Contains("needs to be reconnected"))
            {
                return BadRequest(new { message = ex.Message, code = "GOOGLE_CALENDAR_DISCONNECTED" });
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

        // delete event in Google Calendar with id={eventId}
        [HttpDelete("{eventId}")]
        public async Task<IActionResult> DeleteEvent(string eventId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return BadRequest("Event ID cannot be empty.");

            try
            {
                var userId = GetUserId();
                var accessToken = await _googleAuthService.GetOrRefreshTokenAsync(userId, cancellationToken);
                await _googleCalendarService.DeleteEventAsync(accessToken, eventId, cancellationToken);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not integrated") || ex.Message.Contains("needs to be reconnected"))
            {
                return BadRequest(new { message = ex.Message, code = "GOOGLE_CALENDAR_DISCONNECTED" });
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
