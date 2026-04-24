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
        public ActionResult<IEnumerable<InterestDto>> GetAll()
        {
            // ✏️ Modified: Retrieving from service directly already mapped
            return Ok(_service.GetAllInterests());
        }

    }
}
