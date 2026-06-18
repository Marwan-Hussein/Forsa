using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Owner;
using Application.Core.Interfaces.OwnerInterfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forsa.Controllers.OwnerControllers
{
    [Route("api/owner/booking-requests")]
    [ApiController]
    [Authorize(Policy = "OwnerOnly")]
    public class OwnerBookingRequestsController : ControllerBase
    {
        private readonly IBookingRequestOwnerService _bookingService;
        private readonly IOwnerFeedbackService _feedbackService;
        private readonly IValidator<OrganizerFeedbackDto> _feedbackValidator;

        public OwnerBookingRequestsController(
            IBookingRequestOwnerService bookingService,
            IOwnerFeedbackService feedbackService,
            IValidator<OrganizerFeedbackDto> feedbackValidator)
        {
            _bookingService = bookingService;
            _feedbackService = feedbackService;
            _feedbackValidator = feedbackValidator;
        }

        private int GetOwnerId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // GET api/owner/booking-requests
        [HttpGet]
        public async Task<ActionResult<List<BookingRequestDetailsDto>>> GetBookingRequests()
        {
            try
            {
                var result = await _bookingService.GetOwnerBookingRequestsAsync(GetOwnerId());
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while fetching booking requests." });
            }
        }

        // PATCH api/owner/booking-requests/{requestId}
        [HttpPatch("{requestId:int}")]
        public async Task<ActionResult<BookingRequestDetailsDto>> ProcessBookingRequest(
            int requestId, [FromBody] ProcessBookingRequestDto dto)
        {
            try
            {
                var result = await _bookingService.ProcessOrganizerBookingRequestAsync(
                    GetOwnerId(), requestId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred while processing the request." }); }
        }

        // POST api/owner/booking-requests/{bookingRequestId}/feedback
        [HttpPost("{bookingRequestId:int}/feedback")]
        public async Task<ActionResult<OrganizerFeedbackResponseDto>> SubmitFeedback(
            int bookingRequestId, [FromBody] OrganizerFeedbackDto dto)
        {
            var validation = await _feedbackValidator.ValidateAsync(dto);
            if (!validation.IsValid)
            {
                var errors = validation.Errors
                    .Select(e => new { field = e.PropertyName, message = e.ErrorMessage });
                return BadRequest(new { errors });
            }

            try
            {
                var result = await _feedbackService.SubmitOrganizerFeedbackAsync(
                    GetOwnerId(), bookingRequestId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(500, new { message = "An error occurred while submitting feedback." }); }
        }
    }
}

