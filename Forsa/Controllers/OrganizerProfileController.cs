using Application.Core.DTOs.Organizer;
using Application.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/organizers")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class OrganizerProfileController : ControllerBase
    {
        private readonly IUserProfileService _profileService;

        public OrganizerProfileController(IUserProfileService profileService)
        {
            _profileService = profileService;
        }

        // GET: api/organizers/{id}/profile
        [Authorize(Policy = "AuthenticatedUser")]
        [HttpGet("{id:int}/profile")]
        public async Task<ActionResult<OrganizerProfileDto>> GetProfile(int id)
        {
            try
            {
                var profile = await _profileService.GetOrganizerProfileAsync(id);
                if (profile == null)
                    return NotFound(new { message = "Organizer not found." });
                return Ok(profile);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching organizer profile.");
            }
        }

        // PUT: api/organizers/{id}/profile
        [Authorize(Policy = "OrganizerOnly")]
        [HttpPut("{id:int}/profile")]
        public async Task<ActionResult<OrganizerProfileDto>> UpdateProfile(int id, [FromBody] UpdateOrganizerProfileDto dto)
        {
            try
            {
                var updated = await _profileService.UpdateOrganizerProfileAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Organizer not found." });
                return Ok(updated);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating organizer profile.");
            }
        }
        [HttpPost("{id}/profile-picture")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> UploadProfilePicture(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest("File is empty");
                var result = await _profileService.UploadProfilePictureAsync(id, file);
                return Ok(new { url = result });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
