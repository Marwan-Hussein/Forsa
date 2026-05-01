using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message.Contains("already exists") || ex.Message.Contains("failed"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering the user");
            }
        }

        /// <summary>
        /// Step 1: Initiate registration – validates data, stores it, and sends OTP to email.
        /// </summary>
        [HttpPost("register/initiate")]
        public async Task<ActionResult<OtpResponseDto>> InitiateRegistration([FromBody] RegisterDto request)
        {
            try
            {
                var result = await _authService.InitiateRegistrationAsync(request);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message.Contains("already exists"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while initiating registration.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Step 2: Verify OTP and complete registration.
        /// </summary>
        [HttpPost("register/verify")]
        public async Task<ActionResult<UserDto>> VerifyOtp([FromBody] VerifyOtpDto request)
        {
            try
            {
                var result = await _authService.VerifyOtpAndRegisterAsync(request);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message.Contains("Invalid or expired") || ex.Message.Contains("expired"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex) when (ex.Message.Contains("already exists") || ex.Message.Contains("failed"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during verification.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Resend OTP to the same email (registration data must still be cached).
        /// </summary>
        [HttpPost("register/resend")]
        public async Task<ActionResult<OtpResponseDto>> ResendOtp([FromBody] ResendOtpDto request)
        {
            try
            {
                var result = await _authService.ResendOtpAsync(request);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message.Contains("expired"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while resending OTP.", detail = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto request)
        {
            try
            {
                var result = await _authService.LoginAsync(request);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message == "Invalid Email or Password.")
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while logging in");
            }
        }
    }
}