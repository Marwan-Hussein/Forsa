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
        private readonly IExternalAuth _externalAuth;

        public AuthController(IAuthService authService,IExternalAuth externalAuth , SignInManager<ApplicationUser> signInManager)
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


        // external login endpoints 
        [HttpGet("external-login")]
        public IActionResult ExternalLogin(string provider) {
            var redirectUrl = Url.Action(nameof(ExternalCallBack),"Auth");
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider , redirectUrl);
            return Challenge(properties,provider);
        }

        [HttpGet("external-callback")]
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