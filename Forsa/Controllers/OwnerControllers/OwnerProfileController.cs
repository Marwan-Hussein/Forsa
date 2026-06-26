using Application.Core.DTOs.Owner;
using Application.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.OwnerControllers
{
    [ApiController]
    [Route("api/owner")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class OwnerProfileController : ControllerBase
    {
        private readonly IUserProfileService _profileService;

        public OwnerProfileController(IUserProfileService profileService)
        {
            _profileService = profileService;
        }

        // GET: api/owner/{id}/profile
        [Authorize(Policy = "AuthenticatedUser")]
        [HttpGet("{id:int}/profile")]
        public async Task<ActionResult<OwnerProfileDto>> GetProfile(int id)
        {
            try
            {
                var profile = await _profileService.GetOwnerProfileAsync(id);
                if (profile == null)
                    return NotFound(new { message = "Owner not found." });
                return Ok(profile);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching owner profile.");
            }
        }

        // PUT: api/owner/{id}/profile
        [Authorize(Policy = "OwnerOnly")]
        [HttpPut("{id:int}/profile")]
        public async Task<ActionResult<OwnerProfileDto>> UpdateProfile(int id, [FromBody] UpdateOwnerProfileDto dto)
        {
            try
            {
                var updated = await _profileService.UpdateOwnerProfileAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Owner not found." });
                return Ok(updated);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating owner profile.");
            }
        }
    }
}
