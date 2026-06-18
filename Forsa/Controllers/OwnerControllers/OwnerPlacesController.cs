using Application.Core.DTOs.Place;
using Application.Core.Interfaces.OwnerInterfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forsa.Controllers.OwnerControllers
{
    [Route("api/owner/places")]
    [ApiController]
    [Authorize(Policy = "OwnerOnly")]
    public class OwnerPlacesController : ControllerBase
    {
        private readonly IPlaceOwnerService _placeOwnerService;
        private readonly IValidator<AddPlaceDto> _addPlaceValidator;

        public OwnerPlacesController(
            IPlaceOwnerService placeOwnerService,
            IValidator<AddPlaceDto> validator)
        {
            _placeOwnerService = placeOwnerService;
            _addPlaceValidator = validator;
        }

        private int GetOwnerId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // POST api/owner/places
        [HttpPost]
        public async Task<ActionResult<PlaceDetailsDto>> AddPlace([FromBody] AddPlaceDto dto)
        {
            var validation = await _addPlaceValidator.ValidateAsync(dto);
            if (!validation.IsValid)
            {
                var errors = validation.Errors
                    .Select(e => new { field = e.PropertyName, message = e.ErrorMessage });
                return BadRequest(new { errors });
            }

            try
            {
                var result = await _placeOwnerService.AddNewPlaceAsync(GetOwnerId(), dto);
                return CreatedAtAction(nameof(GetMyPlace), new { id = result.PlaceId }, result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating the place." });
            }
        }

        // GET api/owner/places
        [HttpGet]
        public async Task<ActionResult<List<PlaceDetailsDto>>> GetMyPlaces()
        {
            try
            {
                var result = await _placeOwnerService.GetOwnerPlacesAsync(GetOwnerId());
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while fetching your places." });
            }
        }

        // GET api/owner/places/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PlaceDetailsDto>> GetMyPlace(int id)
        {
            try
            {
                var result = await _placeOwnerService.GetOwnerPlaceByIdAsync(GetOwnerId(), id);
                if (result == null) return NotFound(new { message = "Place not found." });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred." });
            }
        }

        // PUT api/owner/places/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<PlaceDetailsDto>> UpdatePlace(
            int id, [FromBody] UpdatePlaceDto dto)
        {
            try
            {
                var result = await _placeOwnerService.UpdatePlaceAsync(GetOwnerId(), id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while updating the place." });
            }
        }

        // DELETE api/owner/places/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePlace(int id)
        {
            try
            {
                var deleted = await _placeOwnerService.DeletePlaceAsync(GetOwnerId(), id);
                if (!deleted) return NotFound(new { message = "Place not found." });
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the place." });
            }
        }
    }
}
