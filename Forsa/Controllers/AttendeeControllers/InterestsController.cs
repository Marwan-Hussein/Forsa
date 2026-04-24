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
        // ✏️ Modified: Switched to IAttendeeProfileService instead of exposing domain entity with IGenericService
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
