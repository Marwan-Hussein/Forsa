using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AttendeeControllers
{
    
    [ApiController]
    [Route("api/attendees")]
    public class AttendeesController : ControllerBase
    {
        private readonly IAttendeeProfileService _service;
        private readonly IValidator<UpdateAttendeeInterestsDto> _updateInterestsValidator;

        public AttendeesController(
            IAttendeeProfileService service,
            IValidator<UpdateAttendeeInterestsDto> updateInterestsValidator)
        {
            _service = service;
            _updateInterestsValidator = updateInterestsValidator;
        }

        // GET: api/attendees/{id}/profile
        [HttpGet("{id:int}/profile")]
        [ProducesResponseType(typeof(AttendeeProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<AttendeeProfileDto> GetProfile(int id)
        {
            var profile = _service.GetProfile(id);
            if (profile == null) return NotFound(new { message = "Attendee not found." });
            return Ok(profile);
        }

        // GET: api/attendees/{id}/interests
        [HttpGet("{id:int}/interests")]
        [ProducesResponseType(typeof(IEnumerable<InterestDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<IEnumerable<InterestDto>> GetInterests(int id)
        {
            var profile = _service.GetProfile(id);
            if (profile == null) return NotFound(new { message = "Attendee not found." });
            return Ok(profile.Interests);
        }

        // PUT: api/attendees/{id}/interests
        [HttpPut("{id:int}/interests")]
        [ProducesResponseType(typeof(AttendeeProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<AttendeeProfileDto> UpdateInterests(int id, [FromBody] UpdateAttendeeInterestsDto dto)
        {
            var validationResult = _updateInterestsValidator.Validate(dto ?? new UpdateAttendeeInterestsDto());
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

            var updated = _service.UpdateInterests(id, dto?.InterestIds ?? new List<int>());
            if (updated == null) return NotFound(new { message = "Attendee not found." });
            return Ok(updated);
        }
    }
}
