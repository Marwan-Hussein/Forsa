using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AttendeeControllers
{
    [ApiController]
    [Route("api/interests")]
    [ApiConventionType(typeof(DefaultApiConventions))]

    public class InterestsController : ControllerBase
    {
        private readonly IAttendeeProfileService _service;
        public InterestsController(IAttendeeProfileService service)
        {
            _service = service;
        }

        // GET: api/interests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InterestDto>>> GetAll()
        {
            return Ok(await _service.GetAllInterestsAsync());
        }

    }
}
