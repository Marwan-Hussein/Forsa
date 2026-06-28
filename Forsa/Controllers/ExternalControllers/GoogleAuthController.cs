using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Core.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Forsa.Controllers.ExternalControllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoogleAuthController : ControllerBase
    {
        private readonly IGoogleAuthService _googleAuthService;
        private readonly JwtSettings _jwtSettings;

        public GoogleAuthController(
            IGoogleAuthService googleAuthService,
            IOptions<JwtSettings> jwtSettings)
        {
            _googleAuthService = googleAuthService;
            _jwtSettings = jwtSettings.Value;
        }

        [HttpGet("connect")]
        [Authorize]
        public IActionResult Connect()
        {
            try
            {
                // Retrieve the JWT bearer token from the Authorization header to use as secure state
                var authHeader = Request.Headers["Authorization"].ToString();
                var jwt = authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                    ? authHeader.Substring(7).Trim()
                    : string.Empty;

                if (string.IsNullOrEmpty(jwt))
                {
                    return Unauthorized(new { message = "Bearer token is required to initiate connection." });
                }

                // Construct redirect URI pointing to our callback endpoint
                var redirectUri = $"{Request.Scheme}://{Request.Host}/api/GoogleAuth/callback";

                // Generate authorization URL passing the JWT as the state parameter
                var authUrl = _googleAuthService.GetAuthorizationUrl(redirectUri, jwt);

                return Ok(new { url = authUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to generate authorization URL.", error = ex.Message });
            }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state, [FromQuery] string error = null, CancellationToken cancellationToken = default)
        {
            var frontendBaseUrl = !string.IsNullOrEmpty(_jwtSettings.Audience) 
                ? _jwtSettings.Audience.TrimEnd('/') 
                : "http://localhost:5173";

            if (!string.IsNullOrEmpty(error))
            {
                return Redirect($"{frontendBaseUrl}/profile?google-connect=error&message={Uri.EscapeDataString(error)}");
            }

            if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
            {
                return Redirect($"{frontendBaseUrl}/profile?google-connect=error&message=MissingAuthorizationData");
            }

            try
            {
                // Validate state as a JWT token and extract the user ID
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtSettings.Key);
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                ClaimsPrincipal principal;
                try
                {
                    principal = tokenHandler.ValidateToken(state, validationParameters, out _);
                }
                catch (Exception)
                {
                    return Redirect($"{frontendBaseUrl}/profile?google-connect=error&message=InvalidSession");
                }

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Redirect($"{frontendBaseUrl}/profile?google-connect=error&message=InvalidUserClaim");
                }

                var redirectUri = $"{Request.Scheme}://{Request.Host}/api/GoogleAuth/callback";

                // Exchange code for tokens and save them for the user
                var success = await _googleAuthService.ExchangeCodeAndSaveTokenAsync(code, redirectUri, userId, cancellationToken);

                if (success)
                {
                    return Redirect($"{frontendBaseUrl}/profile?google-connect=success");
                }
                else
                {
                    return Redirect($"{frontendBaseUrl}/profile?google-connect=error&message=TokenExchangeFailed");
                }
            }
            catch (Exception ex)
            {
                return Redirect($"{frontendBaseUrl}/profile?google-connect=error&message={Uri.EscapeDataString(ex.Message)}");
            }
        }
    }
}
