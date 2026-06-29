using Application.Core.DTOs.Owner;
using Application.Core.Interfaces.OwnerInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forsa.Controllers.OwnerControllers
{
    [Route("api/owner/dashboard")]
    [ApiController]
    [Authorize(Policy = "OwnerOnly")]
    public class OwnerDashboardController : ControllerBase
    {
        private readonly IOwnerDashboardService _ownerDashboardService;

        public OwnerDashboardController(IOwnerDashboardService ownerDashboardService)
        {
            _ownerDashboardService = ownerDashboardService;
        }

        private int GetOwnerId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // GET api/owner/dashboard/stats
        [HttpGet("stats")]
        public async Task<ActionResult<OwnerDashboardDto>> GetDashboardStats()
        {
            try
            {
                var stats = await _ownerDashboardService.GetOwnerDashboardStatsAsync(GetOwnerId());
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching dashboard stats." });
            }
        }
    }
}
