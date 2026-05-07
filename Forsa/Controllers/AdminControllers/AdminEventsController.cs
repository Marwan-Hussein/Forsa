using Application.Core.DTOs.Event;
using Application.Core.Interfaces.EventInterfaces;
using Domain.ENUMs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AdminControllers
{
    [Route("api/admin/events")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AdminEventsController : ControllerBase
    {
        private readonly IEventAdminService _service;
        public AdminEventsController(IEventAdminService service)
        {
            _service = service;
        } 

        // GET: api/admin/events
        [HttpGet]
        public async Task<ActionResult<List<EventDetailsDto>>> GetAll([FromQuery] EventSearchParameterDto parameters)
        {
            try
            {
                return Ok(await _service.GetAllAsync(parameters));
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching events");
            }
        }

        // DELETE: api/admin/events/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.SoftDeleteAsync(id);
                if (!deleted)
                    return NotFound(new { message = "Event not found." });

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting event");
            }
        }

        // PATCH: api/admin/events/{id}/status
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateEventStatusDto request)
        {
            try
            {
                if (!Enum.IsDefined(typeof(EventStatus), request.Status))
                    return BadRequest(new { message = "Invalid event status." });

                var updated = await _service.UpdateStatusAsync(id, request.Status);
                if (!updated)
                    return NotFound(new { message = "Event not found." });

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating event status");
            }
        }
    }
}
