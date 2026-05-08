using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Application.Core.DTOs.AttendeeDTOs;
using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Application.Core.Interfaces.AdminServices;

namespace Forsa.Controllers.AdminControllers
{
    [ApiController]
    [Route("api/admin/attendees")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    [Authorize(Policy = "AdminOnly")]
    public class AdminAttendeesController : ControllerBase
    {
        private readonly IAttendeeAdminService _service;
        private readonly IValidator<UpdateAttendeeProfileDto> _updateValidator;

        public AdminAttendeesController(
            IAttendeeAdminService service,
            IValidator<UpdateAttendeeProfileDto> updateValidator)
        {
            _service = service;
            _updateValidator = updateValidator;
        }

        // GET: api/admin/attendees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendeeProfileDto>>> GetAll([FromQuery] AttendeeSearchParameters parameters)
        {
            try
            {
                return Ok(await _service.GetAllAsync(parameters));
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching attendees");
            }
        }

        // GET: api/admin/attendees/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AttendeeProfileDto>> GetById(int id)
        {
            try
            {
                var attendee = await _service.GetByIdAsync(id);
                if (attendee == null)
                    return NotFound(new { message = "Attendee not found." });

                return Ok(attendee);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching attendee");
            }
        }

        // PUT: api/admin/attendees/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<AttendeeProfileDto>> Update(int id, UpdateAttendeeProfileDto dto)
        {
            try
            {
                dto ??= new UpdateAttendeeProfileDto();

                var validationResult = await _updateValidator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed." });
                }

                var updated = await _service.UpdateAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Attendee not found." });

                return Ok(updated);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating attendee");
            }
        }

        // DELETE: api/admin/attendees/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.SoftDeleteAsync(id);
                if (!deleted)
                    return NotFound(new { message = "Attendee not found." });

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting attendee");
            }
        }
    }
}