using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application.Core.DTOs.Admin;
using Application.Queries.Admin;

namespace Forsa.Controllers.AdminControllers
{
    [ApiController]
    [Route("api/admin/reports")]
    public class AdminReportsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AdminReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("performance")]
        public async Task<ActionResult<PerformanceReportDTO>> GetPerformanceReport(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            var result = await _mediator.Send(
                new GetPerformanceReportQuery(from, to)
                );

            return Ok(result);
        }
    }
}
