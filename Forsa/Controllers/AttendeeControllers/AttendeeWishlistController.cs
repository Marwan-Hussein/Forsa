using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AttendeeControllers
{
    [ApiController]
    [Route("api/attendees")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class AttendeeWishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public AttendeeWishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        // GET: api/attendees/{attendeeId}/wishlist
        [Authorize(Policy = "AttendeeOnly")]
        [HttpGet("{attendeeId:int}/wishlist")]
        public async Task<ActionResult<List<WishlistEventDto>>> GetWishlist(int attendeeId)
        {
            try
            {
                var wishlist = await _wishlistService.GetWishlistAsync(attendeeId);
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching the wishlist: {ex.Message}");
            }
        }

        // POST: api/attendees/{attendeeId}/wishlist/{eventId}
        [Authorize(Policy = "AttendeeOnly")]
        [HttpPost("{attendeeId:int}/wishlist/{eventId:int}")]
        public async Task<IActionResult> AddToWishlist(int attendeeId, int eventId)
        {
            try
            {
                await _wishlistService.AddToWishlistAsync(attendeeId, eventId);
                return Ok(new { message = "Event added to wishlist." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while adding to wishlist: {ex.Message}");
            }
        }

        // DELETE: api/attendees/{attendeeId}/wishlist/{eventId}
        [Authorize(Policy = "AttendeeOnly")]
        [HttpDelete("{attendeeId:int}/wishlist/{eventId:int}")]
        public async Task<IActionResult> RemoveFromWishlist(int attendeeId, int eventId)
        {
            try
            {
                await _wishlistService.RemoveFromWishlistAsync(attendeeId, eventId);
                return Ok(new { message = "Event removed from wishlist." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while removing from wishlist: {ex.Message}");
            }
        }
    }
}
