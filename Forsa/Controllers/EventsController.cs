using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
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
        public ActionResult<IEnumerable<EventDetailsDto>> GetAllEvents()
        {
            return Ok(_eventService.GetAllEvents());
        }

        [HttpGet("search")]
        public ActionResult<IEnumerable<EventDetailsDto>> SearchEvents([FromQuery] EventSearchParameter parameters)
        {
            return Ok(_eventService.FilterEventsByParameters(parameters));
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
    }
}
