using Application.Core.DTOs.Place;
using Application.Core.Interfaces.PlaceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forsa.Controllers.OwnerControllers
{
    [Route("api/owner/places/{placeId:int}/media")]
    [ApiController]
    [Authorize(Policy = "OwnerOnly")]
    public class OwnerPlaceMediaController : ControllerBase
    {
        private readonly IPlaceMediaService _mediaService;

        public OwnerPlaceMediaController(IPlaceMediaService mediaService)
        {
            _mediaService = mediaService;
        }

        private int GetOwnerId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // POST api/owner/places/{placeId}/media
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<List<PlaceMediaDto>>> Upload(
            int placeId,
            [FromForm] List<MediaUploadDto> mediaFiles)
        {
            try
            {
                var result = await _mediaService.UploadPlaceMediaAsync(GetOwnerId(), placeId, mediaFiles);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred while uploading media." }); }
        }

        // GET api/owner/places/{placeId}/media
        [HttpGet]
        public async Task<ActionResult<List<PlaceMediaDto>>> GetMedia(int placeId)
        {
            try
            {
                var result = await _mediaService.GetPlaceMediaAsync(placeId);
                return Ok(result);
            }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred." }); }
        }

        // DELETE api/owner/places/{placeId}/media/{mediaId}
        [HttpDelete("{mediaId:int}")]
        public async Task<IActionResult> DeleteMedia(int placeId, int mediaId)
        {
            try
            {
                var deleted = await _mediaService.DeletePlaceMediaAsync(GetOwnerId(), placeId, mediaId);
                if (!deleted) return NotFound(new { message = "Media not found." });
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred while deleting media." }); }
        }
    }
}
