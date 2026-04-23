using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public EventsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
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
