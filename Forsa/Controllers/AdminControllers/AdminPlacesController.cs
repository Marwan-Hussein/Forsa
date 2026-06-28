using Application.Core.DTOs.Place;
using Application.Core.Interfaces.PlaceInterfaces;
using Domain.ENUMs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AdminControllers
{
    [Route("api/admin/places")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AdminPlacesController : ControllerBase
    {
        private readonly IPlaceAdminService _service;

        public AdminPlacesController(IPlaceAdminService service)
        {
            _service = service;
        }

        // GET: api/admin/places
        // Returns all places (except soft deleted)
        [HttpGet]
        public async Task<ActionResult<List<PlaceDetailsDto>>> GetAll(
            [FromQuery] PlaceSearchParameterDto parameters)
        {
            try
            {
                var result = await _service.GetAllPlacesAsync(parameters);
                return Ok(result ?? new List<PlaceDetailsDto>());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while fetching places." });
            }
        }

        // GET: api/admin/places/pending
        // Returns all places whose Status == Pending
        [HttpGet("pending")]
        public async Task<ActionResult<List<PlaceDetailsDto>>> GetPending(
            [FromQuery] PlaceSearchParameterDto parameters)
        {
            try
            {
                var result = await _service.GetPendingPlacesAsync(parameters);
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while fetching pending places." });
            }
        }

        // PATCH: api/admin/places/{id}/status
        // Body: { "status": 2, "reason": "optional" }
        // Admin may only set Approved (2) or Rejected (3)
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePlaceStatusDto request)
        {
            try
            {
                // valid enum value
                if (!Enum.IsDefined(typeof(PlaceStatus), request.Status))
                    return BadRequest(new { message = "Invalid place status value." });

                // admin can only approve or reject
                if (request.Status != PlaceStatus.Approved && request.Status != PlaceStatus.Rejected)
                    return BadRequest(new { message = "Admin can only set status to Approved or Rejected." });

                var updated = await _service.UpdateStatusAsync(id, request.Status, request.Reason);

                if (!updated)
                    return NotFound(new { message = "Place not found." });

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                // Service threw because Rejected was sent without a reason
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while updating place status." });
            }
        }
        // DELETE: api/admin/places/{id}
        // Soft delete a place
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePlace(int id)
        {
            try
            {
                var deleted = await _service.SoftDeletePlaceAsync(id);
                if (!deleted)
                    return NotFound(new { message = "Place not found or already deleted." });

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the place." });
            }
        }
    }
}
