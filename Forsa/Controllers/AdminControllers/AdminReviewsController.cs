using Application.Core.Interfaces.PlaceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AdminControllers
{
    [Route("api/admin/reviews")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AdminReviewsController : ControllerBase
    {
        private readonly IPlaceAdminService _service;

        public AdminReviewsController(IPlaceAdminService service)
        {
            _service = service;
        }

        // GET: api/admin/reviews
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? targetType)
        {
            try
            {
                var reviews = await _service.GetAllFeedbacksAsync(targetType);
                return Ok(reviews);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while fetching reviews." });
            }
        }

        // DELETE: api/admin/reviews/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.SoftDeleteFeedbackAsync(id);

                if (!deleted)
                    return NotFound(new { message = "Review not found or already deleted." });

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the review." });
            }
        }
    }
}
