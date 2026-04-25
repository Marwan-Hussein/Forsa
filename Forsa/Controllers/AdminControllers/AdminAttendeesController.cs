using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using FluentValidation;

namespace Forsa.Controllers.AdminControllers
{
    [ApiController]
    [Route("api/admin/attendees")]
    [ApiConventionType(typeof(DefaultApiConventions))]
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
            return Ok(await _service.GetAllAsync(parameters));
        }

        // GET: api/admin/attendees/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AttendeeProfileDto>> GetById(int id)
        {
            var attendee = await _service.GetByIdAsync(id);
            if (attendee == null)
                return NotFound(new { message = "Attendee not found." });

            return Ok(attendee);
        }

        // PUT: api/admin/attendees/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<AttendeeProfileDto>> Update(int id, UpdateAttendeeProfileDto dto)
        {
            dto ??= new UpdateAttendeeProfileDto();

            var validationResult = await _updateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new
                {
                    message = "Validation failed.",
                    errors = validationResult.Errors
                        .GroupBy(error => error.PropertyName)
                        .ToDictionary(
                            group => group.Key,
                            group => group.Select(error => error.ErrorMessage).ToArray())
                });
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = "Attendee not found." });

            return Ok(updated);
        }

        // DELETE: api/admin/attendees/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.SoftDeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = "Attendee not found." });

            return NoContent();
        }
    }
}