using Application.Core.DTOs.Booking;
using Application.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<ActionResult<BookingResponseDto>> CreateBooking([FromBody] CreateBookingRequestDto request)
        {
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
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the booking");
            }
        }

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
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while cancelling the booking");
            }
        }

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
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the booking");
            }
        }
    }
}
