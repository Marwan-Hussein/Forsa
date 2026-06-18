using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
using Application.Core.Interfaces.EventInterfaces;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IBookingService _bookingService;

        public EventsController(IEventService eventService, IBookingService bookingService)
        {
            _eventService = eventService;
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDetailsDto>>> GetAllEvents()
        {
            return Ok(await _eventService.GetAllEvents());
        }

        [HttpGet("search")]
        public async Task<ActionResult<EventDetailsDto>> SearchEvents([FromQuery] EventSearchParameterDto parameters)
        {
          
            return Ok(await _eventService.FilterEventsByParameters(parameters));
        }

        [HttpGet("{id}/details")]
        public async Task<ActionResult<EventDetailsDto>> GetEventDetails(int id)
        {
            try
            {
                var eventDetails = await _bookingService.GetEventDetailsAsync(id);
                return Ok(eventDetails);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving event details");
            }
        }
        [HttpPost("{id}/evaluate-status")]
        public async Task<ActionResult> EvaluateEventStatus(int id)
        {
            try
            {
                await _eventService.EvaluateEventStatusAsync(id);
                return Ok(new { Message = "Event status evaluated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while evaluating event status");
            }
        }
    }
}
