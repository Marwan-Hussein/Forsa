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
    }
}
