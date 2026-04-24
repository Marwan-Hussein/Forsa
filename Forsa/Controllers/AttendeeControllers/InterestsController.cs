using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces;
using Domain.Entities.AttendeeEntities;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AttendeeControllers
{
    [ApiController]
    [Route("api/interests")]
    [ApiConventionType(typeof(DefaultApiConventions))]

    public class InterestsController : ControllerBase
    {
        private readonly IGenericService<AttendeeInterest> _service;
        public InterestsController(IGenericService<AttendeeInterest> service)
        {
            _service = service;
        }

        // GET: api/interests
        [HttpGet]
        public ActionResult<IEnumerable<InterestDto>> GetAll()
        {
            var list = _service.GetAll()
                               .Select(i => new InterestDto
                               {
                                    Id = i.InterestId,
                                    Name = i.InterestName
                               })
                               .ToList();
            return Ok(list);
        }

    }
}
