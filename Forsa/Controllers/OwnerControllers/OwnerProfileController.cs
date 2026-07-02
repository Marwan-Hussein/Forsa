using Application.Core.DTOs.Owner;
using Application.Core.Interfaces;
using Application.Core.DTOs.Payment;
using System.Security.Claims;
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
        private readonly IPaymentService _paymentService;

        public OwnerProfileController(IUserProfileService profileService, IPaymentService paymentService)
        {
            _profileService = profileService;
            _paymentService = paymentService;
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

        // POST: api/owner/payout
        [Authorize(Policy = "OwnerOnly")]
        [HttpPost("payout")]
        public async Task<ActionResult<PayoutResponseDto>> RequestPayout([FromBody] PayoutRequestDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var response = await _paymentService.InitiateOrganizerPayoutAsync(userId, dto.Amount);
                if (!response.IsSuccess)
                {
                    return BadRequest(response);
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/owner/payout-method
        [Authorize(Policy = "OwnerOnly")]
        [HttpPost("payout-method")]
        public async Task<ActionResult> ConfigurePayoutMethod([FromBody] ConfigurePayoutMethodDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var result = await _paymentService.ConfigurePayoutMethodAsync(userId, dto);
                if (!result)
                {
                    return BadRequest(new { message = "Failed to configure payout method." });
                }
                return Ok(new { message = "Payout method configured successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("{id}/profile-picture")]
        [Authorize(Roles = "Owner,PlaceOwner")]
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
