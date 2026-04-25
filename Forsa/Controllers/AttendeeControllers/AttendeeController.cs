using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AttendeeControllers
{
    
    [ApiController]
    [Route("api/attendees")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class AttendeesController : ControllerBase
    {
        private readonly IAttendeeProfileService _service;
        private readonly IValidator<UpdateAttendeeProfileDto> _updateProfileValidator;
        private readonly IValidator<UpdateAttendeeInterestsDto> _updateInterestsValidator;

        public AttendeesController(
            IAttendeeProfileService service,
            IValidator<UpdateAttendeeProfileDto> updateProfileValidator,
            IValidator<UpdateAttendeeInterestsDto> updateInterestsValidator)
        {
            _service = service;
            _updateProfileValidator = updateProfileValidator;
            _updateInterestsValidator = updateInterestsValidator;
        }

        // -------------------------- attendee/profile endpoints --------------------------

        // GET: api/attendees/{id}/profile
        [HttpGet("{id:int}/profile")]
        public async Task<ActionResult<AttendeeProfileDto>> GetProfile(int id)
        {
            var profile = await _service.GetProfileAsync(id);
            if (profile == null) return NotFound(new { message = "Attendee not found." });
            return Ok(profile);
        }

        // PUT: api/attendees/{id}/profile
        [HttpPut("{id:int}/profile")]
        public async Task<ActionResult<AttendeeProfileDto>> UpdateProfile(int id, UpdateAttendeeProfileDto dto)
        {
            dto ??= new UpdateAttendeeProfileDto();

            var validationResult = await _updateProfileValidator.ValidateAsync(dto);
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

            var updated = await _service.UpdateProfileAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Attendee not found." });
            return Ok(updated);
        }

        // -------------------------- attendee/interests endpoints --------------------------

        // GET: api/attendees/{id}/interests
        [HttpGet("{id:int}/interests")]
        public async Task<ActionResult<IEnumerable<InterestDto>>> GetInterests(int id)
        {
            var profile = await _service.GetProfileAsync(id);
            if (profile == null) return NotFound(new { message = "Attendee not found." });
            return Ok(profile.Interests);
        }

        // PUT: api/attendees/{id}/interests
        [HttpPut("{id:int}/interests")]
        public async Task<ActionResult<AttendeeProfileDto>> UpdateInterests(int id, UpdateAttendeeInterestsDto dto)
        {
            dto ??= new UpdateAttendeeInterestsDto();

            var validationResult = await _updateInterestsValidator.ValidateAsync(dto);
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

            var updated = await _service.UpdateInterestsAsync(id, dto?.InterestIds ?? new List<int>());
            if (updated == null) return NotFound(new { message = "Attendee not found." });
            return Ok(updated);
        }
    }
}
