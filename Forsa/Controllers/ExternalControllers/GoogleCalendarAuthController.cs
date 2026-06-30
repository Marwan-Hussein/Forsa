using Application.Core.Interfaces.ExternalServicesInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
namespace Forsa.Controllers.ExternalControllers
{
    [Route("api/calendar")]
    [ApiController]
    [Authorize]
    public class GoogleCalendarAuthController : ControllerBase
    {
        private readonly IGoogleCalendarAuthService _authService;
        private readonly ILogger<GoogleCalendarAuthController> _logger;

        public GoogleCalendarAuthController(
            IGoogleCalendarAuthService authService,
            ILogger<GoogleCalendarAuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpGet("connect")]
        public IActionResult Connect([FromQuery] string returnUrl)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { message = "Unable to determine user identity." });
            }

            var redirectUri = Url.Action(nameof(Callback), "GoogleCalendarAuth", null, Request.Scheme, Request.Host.Value)!;
            var state = JsonSerializer.Serialize(new { userId, returnUrl });
            var authorizationUrl = _authService.GenerateAuthorizationUrl(redirectUri, state);

            return Ok(new { authorizationUrl });
        }

        [HttpGet("callback")]
        [AllowAnonymous]
        public async Task<IActionResult> Callback([FromQuery] string? code, [FromQuery] string? state, [FromQuery] string? error)
        {
            if (!string.IsNullOrWhiteSpace(error))
            {
                _logger.LogWarning("Google OAuth callback returned error: {Error}", error);
                return BadRequest(new { message = error });
            }

            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
            {
                return BadRequest(new { message = "Code and state are required." });
            }

            var parsedState = JsonDocument.Parse(state);
            var userId = parsedState.RootElement.GetProperty("userId").GetString();
            var returnUrl = parsedState.RootElement.GetProperty("returnUrl").GetString();

            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest(new { message = "Invalid state payload." });

            var redirectUri = Url.Action(nameof(Callback), "GoogleCalendarAuth", null, Request.Scheme, Request.Host.Value)!;
            var tokenDto = await _authService.ExchangeCodeForTokenAsync(code, redirectUri);
            var userInfo = await _authService.GetUserInfoAsync(tokenDto);
            await _authService.SaveUserTokenAsync(int.Parse(userId), tokenDto, userInfo.Email);

            if (!string.IsNullOrWhiteSpace(returnUrl))
            {
                return Redirect(returnUrl);
            }

            return Ok(new { message = "Google Calendar connected successfully." });
        }
    }
}
