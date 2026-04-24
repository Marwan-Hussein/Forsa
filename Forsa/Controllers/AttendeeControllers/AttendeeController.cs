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

        // GET: api/attendees/{id}/profile
        [HttpGet("{id:int}/profile")]
        public ActionResult<AttendeeProfileDto> GetProfile(int id)
        {
            var profile = _service.GetProfile(id);
            if (profile == null) return NotFound(new { message = "Attendee not found." });
            return Ok(profile);
        }

        // PUT: api/attendees/{id}/profile
        [HttpPut("{id:int}/profile")]
        public ActionResult<AttendeeProfileDto> UpdateProfile(int id, UpdateAttendeeProfileDto dto)
        {
            var validationResult = _updateProfileValidator.Validate(dto ?? new UpdateAttendeeProfileDto());
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

            var updated = _service.UpdateProfile(id, dto);
            if (updated == null) return NotFound(new { message = "Attendee not found." });
            return Ok(updated);
        }

        // GET: api/attendees/{id}/interests
        [HttpGet("{id:int}/interests")]
        public ActionResult<IEnumerable<InterestDto>> GetInterests(int id)
        {
            var profile = _service.GetProfile(id);
            if (profile == null) return NotFound(new { message = "Attendee not found." });
            return Ok(profile.Interests);
        }

        // PUT: api/attendees/{id}/interests
        [HttpPut("{id:int}/interests")]
        public ActionResult<AttendeeProfileDto> UpdateInterests(int id, UpdateAttendeeInterestsDto dto)
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
