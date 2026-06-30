using Application.Core.DTOs.Booking;
using Application.Core.DTOs.Event;
using Application.Core.DTOs.PromoCode;
using Application.Core.Interfaces;
using Application.Core.Interfaces.OrganizerInterfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Core.DTOs.Payment;
using System.Security.Claims;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IPromoService _promoService;
        private readonly IValidator<CreateBookingRequestDto> _validator;
        private readonly ICheckoutService _checkoutService;
        private readonly IPaymentService _paymentService;

        public BookingsController(
            IBookingService bookingService, 
            IPromoService promoService, 
            IValidator<CreateBookingRequestDto> validator,
            ICheckoutService checkoutService,
            IPaymentService paymentService)
        {
            _bookingService = bookingService;
            _promoService = promoService;
            _validator = validator;
            _checkoutService = checkoutService;
            _paymentService = paymentService;
        }

        [Authorize(Policy = "AttendeeOnly")]
        [HttpPost]
        public async Task<ActionResult<BookingResponseDto>> CreateBooking([FromBody] CreateBookingRequestDto request)
        {
            // FluentValidation (BEFORE any DB call)
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .Select(e => new { field = e.PropertyName, message = e.ErrorMessage });
                return BadRequest(new { errors });
            }

            try
            {
                var result = await _bookingService.CreateBookingAsync(request);
                return CreatedAtAction(nameof(GetBooking), new { id = result.BookingId }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the booking");
            }
        }

        [Authorize(Policy = "BookingOwnerOrAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                await _bookingService.CancelBookingAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while cancelling the booking");
            }
        }

        [Authorize(Policy = "AuthenticatedUser")]
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingResponseDto>> GetBooking(int id)
        {
            try
            {
                var booking = await _bookingService.GetBookingAsync(id);
                return Ok(booking);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving the booking");
            }
        }

        [Authorize(Policy = "BookingOwnerOrAdmin")]
        [HttpGet("{id}/ticket")]
        public async Task<IActionResult> GetTicketFromQr(int id)
        {
            try
            {
                var qrImage = await _bookingService.GetTicketFromQr(id);
                return File(qrImage, "image/png");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving the ticket");
            }
        }

        [Authorize(Roles = "Organizer,Admin")]
        [HttpPost("verify-attendance")]
        public async Task<IActionResult> VerifyAttendance([FromBody] VerifyAttendanceRequestDto request)
        {
            try
            {
                await _bookingService.VerifyAttendanceViaQrCodeAsync(request.EventId, request.QrCode);
                return Ok(new { message = "Attendance verified successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while verifying attendance");
            }
        }

        [Authorize(Roles = "Organizer,Admin")]
        [HttpPost("block-attendee")]
        public async Task<IActionResult> BlockAttendee([FromBody] BlockAttendeeRequestDto request)
        {
            try
            {
                await _bookingService.BlockAttendeeFromEventAsync(request.EventId, request.AttendeeId);
                return Ok(new { message = "Attendee blocked from event successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while blocking the attendee");
            }
        }

        [Authorize(Roles = "Organizer,Admin")]
        [HttpPost("event/{eventId}/promo-codes")]
        public async Task<IActionResult> GeneratePromoCode(int eventId, [FromBody] OrganizerPromoCodeDto dto)
        {
            try
            {
                var (isSuccess, message) = await _promoService.GeneratePromoCode(eventId, dto);
                if (!isSuccess)
                {
                    return BadRequest(new { message });
                }
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while generating the promo code.", details = ex.Message });
            }
        }

        [Authorize(Roles = "Organizer,Admin")]
        [HttpPost("event/{eventId}/promo-codes/terminate")]
        public async Task<IActionResult> TerminatePromoCode(int eventId, [FromBody] OrganizerTerminatePromoCodeDTO dto)
        {
            try
            {
                var (isSuccess, message) = await _promoService.TerminatePromoCode(eventId, dto);
                if (!isSuccess)
                {
                    return BadRequest(new { message });
                }
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while terminating the promo code.", details = ex.Message });
            }
        }

        [Authorize(Policy = "AttendeeOnly")]
        [HttpPost("{bookingId:int}/checkout")]
        public async Task<ActionResult<PaymentResponseDto>> ProcessBookingCheckout(int bookingId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var response = await _checkoutService.ProcessEventCheckoutAsync(bookingId, userId);
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

        [HttpPost("callback")]
        public async Task<IActionResult> PaymobCallback([FromBody] PaymobWebhookDto payload)
        {
            try
            {
                var result = await _paymentService.ProcessPaymentCallbackAsync(payload);
                if (result)
                {
                    return Ok();
                }
                return BadRequest("Webhook processing failed.");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "AuthenticatedUser")]
        [HttpPost("promo-codes/validate")]
        public async Task<IActionResult> ValidatePromoCode([FromBody] AttendeePromoCodeDto dto)
        {
            try
            {
                var (isSuccess, message) = await _promoService.ValidatePromoCode(dto);
                if (!isSuccess)
                {
                    return BadRequest(new { message });
                }
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while validating the promo code.", details = ex.Message });
            }
        }
    }
}
