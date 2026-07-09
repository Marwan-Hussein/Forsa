using Application.Core.DTOs.Place;
using Application.Core.Interfaces.OwnerInterfaces;
using Application.Core.Interfaces.AdminServices;
using Application.Core.Interfaces;
using Application.Core.DTOs.CommonDTOs;
using Domain.ENUMs;
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
        private readonly IPlaceAvailabilityService _availabilityService;
        private readonly IValidator<AddPlaceDto> _addPlaceValidator;
        private readonly IAdminUserService _adminUserService;
        private readonly INotifierService _notifierService;

        public OwnerPlacesController(
            IPlaceOwnerService placeOwnerService,
            IPlaceAvailabilityService availabilityService,
            IAdminUserService adminUserService,
            INotifierService notifierService,
            IValidator<AddPlaceDto> validator)
        {
            _placeOwnerService = placeOwnerService;
            _availabilityService = availabilityService;
            _adminUserService = adminUserService;
            _notifierService = notifierService;
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

        // POST api/owner/places/{placeId}/calendar
        [HttpPost("{placeId:int}/calendar")]
        public async Task<ActionResult<PlaceAvailabilityDto>> SetAvailability(
            int placeId, [FromBody] CalendarUpdateDto dto)
        {
            try
            {
                var result = await _availabilityService.UpdatePlaceAvailabilityCalendarAsync(
                    GetOwnerId(), placeId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred while updating availability." }); }
        }

        // GET api/owner/places/{placeId}/calendar?fromDate=2025-01-01&toDate=2025-01-31 (to filter results by date range)
        [HttpGet("{placeId:int}/calendar")]
        public async Task<ActionResult<List<PlaceAvailabilityDto>>> GetCalendar(
            int placeId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var result = await _availabilityService.GetPlaceCalendarAsync(
                    GetOwnerId(), placeId, fromDate, toDate);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred." }); }
        }

        // DELETE api/owner/places/{placeId}/calendar/{slotId}
        [HttpDelete("{placeId:int}/calendar/{slotId:int}")]
        public async Task<IActionResult> RemoveSlot(int placeId, int slotId)
        {
            try
            {
                var removed = await _availabilityService.RemoveAvailabilitySlotAsync(
                    GetOwnerId(), placeId, slotId);
                if (!removed) return NotFound(new { message = "Slot not found." });
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred while removing the slot." }); }
        }
    }
}

