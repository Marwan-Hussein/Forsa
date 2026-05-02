using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly SignInManager<ApplicationUser> _signInManager;
        

        public AuthController(IAuthService authService , SignInManager<ApplicationUser> signInManager)
        {
            _authService = authService;
            _signInManager = signInManager;
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
            catch (Exception ex) when (ex.Message == "Invalid email or password.")
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while logging in");
            }
        }


        //// external login endpoints 
        //[HttpGet("external-login")]
        //public IActionResult ExternalLogin(string provider) {
        //    var redirectUrl = Url.Action(nameof(ExternalCallBack),"Auth");
        //    var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider , redirectUrl);
        //    return Challenge(properties,provider);
        //}

        /*[HttpGet("external-callback")]
        public async Task<IActionResult> ExternalCallBack() { 

            var info = await _signInManager.GetExternalLoginInfoAsync();

            if (info == null) {
                return StatusCode(500, "Error loading external information");
            }

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(email)) { 
                return StatusCode(500, "An email is required from provider");
            }

            var name = info.Principal.FindFirstValue(ClaimTypes.Name);

            var authDto = new ExternalAuthDto
            {

                Provider = info.LoginProvider,
                ProviderKey = info.ProviderKey,
                Email = email,
                Name = name
            };

            var userDto = await _externalAuth.ProcessExternalLoginAsync(authDto);

            return Ok(userDto);

        }
*/

        [HttpPost("refresh-token")]
        public async Task<ActionResult<UserDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(request);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message == "Invalid refresh token.")
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while refreshing the token");
            }
        }

        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                await _authService.RevokeRefreshTokenAsync(request);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message == "Invalid refresh token.")
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while revoking the token");
            }
        }
    }
}
