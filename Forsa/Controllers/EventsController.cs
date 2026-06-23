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
                return StatusCode(500, $"An error occurred while evaluating event status: {ex.ToString()}\n{ex.Message}");
            }
        }

        [HttpPost("{id}/deduct-tickets")]
        public async Task<ActionResult> DeductTickets(int id, [FromQuery] int quantity)
        {
            try
            {
                if (quantity <= 0) return BadRequest("Quantity must be greater than 0");
                
                var success = await _eventService.DeductTicketInventoryAsync(id, quantity);
                if (!success)
                    return BadRequest("Not enough tickets available or event not found.");

                return Ok(new { Message = "Tickets deducted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deducting tickets: {ex.ToString()}\n{ex.Message}");
            }
        }

        [HttpPost("{id}/release-tickets")]
        public async Task<ActionResult> ReleaseTickets(int id, [FromQuery] int quantity)
        {
            try
            {
                if (quantity <= 0) return BadRequest("Quantity must be greater than 0");
                
                await _eventService.ReleaseTicketInventoryAsync(id, quantity);
                return Ok(new { Message = "Tickets released successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while releasing tickets: {ex.ToString()}\n{ex.Message}");
            }
        }
    }
}
