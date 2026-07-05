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
        private readonly IExternalAuthService _externalAuth;

        public AuthController(IAuthService authService , SignInManager<ApplicationUser> signInManager, IExternalAuthService externalAuth)
        {
            _authService = authService;
            _signInManager = signInManager;
            _externalAuth = externalAuth;   
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
            catch (Exception ex) when (ex.Message.Contains("blocked"))
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    message = "An error occurred while logging in", 
                    error = ex.Message, 
                    innerError = ex.InnerException?.Message 
                });
            }
        }


        [HttpGet("external-login")]
        public IActionResult ExternalLogin(string provider, string? role = null)
        {
            var redirectUrl = Url.Action(nameof(ExternalCallBack), "Auth");
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            if (role != null)
            {
                properties.Items["requestedRole"] = role;
            }
            return Challenge(properties, provider);
        }

        [HttpGet("external-callback")]
        public async Task<IActionResult> ExternalCallBack()
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();

            if (info == null)
            {
                return BadRequest(new { message = "Error loading external login information from provider." });
            }
            var requestedRole = info.AuthenticationProperties.Items.ContainsKey("requestedRole")
                        ? info.AuthenticationProperties.Items["requestedRole"]
                        : null;

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var name = info.Principal.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email claim is required from the provider." });
            }

            var authDto = new ExternalAuthDto
            {
                Provider = info.LoginProvider,
                ProviderKey = info.ProviderKey,
                Email = info.Principal.FindFirstValue(ClaimTypes.Email),
                Name = info.Principal.FindFirstValue(ClaimTypes.Name),
                RequestedRole = requestedRole 
            };

            var result = await _externalAuth.ProcessExternalLoginAsync(authDto);

            if (!result.IsSuccess)
            {
                if (result.NeedsRoleSelection)
                {
                    return Redirect($"http://localhost:5173/login?externalRegister=true&provider={Uri.EscapeDataString(result.Provider)}&providerKey={Uri.EscapeDataString(result.ProviderKey)}&email={Uri.EscapeDataString(result.Email)}&name={Uri.EscapeDataString(result.Name ?? "")}");
                }
                return Redirect($"http://localhost:5173/login?error={Uri.EscapeDataString(result.Message)}");
            }

            return Redirect($"http://localhost:5173/login?token={result.User.Token}&refreshToken={result.User.RefreshToken}&fullName={Uri.EscapeDataString(result.User.FullName)}&email={Uri.EscapeDataString(result.User.Email)}");
        }

        [HttpPost("external-register")]
        public async Task<IActionResult> ExternalRegister([FromBody] ExternalAuthDto request)
        {
            var result = await _externalAuth.ProcessExternalLoginAsync(request);
            if (!result.IsSuccess)
            {
                return BadRequest(new { message = result.Message });
            }
            return Ok(result.User);
        }

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
