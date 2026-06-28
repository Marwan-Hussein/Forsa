using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Core.Settings;
using Domain.Entities.AuthEntities;
using Domain.Interfaces;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Calendar.v3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Services.ExternalServices
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly GoogleAuthSettings _settings;
        private readonly IQueryableRepository<UserGoogleToken> _tokenRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<GoogleAuthService> _logger;

        public GoogleAuthService(
            IOptions<GoogleAuthSettings> settings,
            IQueryableRepository<UserGoogleToken> tokenRepository,
            IUnitOfWork unitOfWork,
            ILogger<GoogleAuthService> logger)
        {
            _settings = settings.Value;
            _tokenRepository = tokenRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public string GetAuthorizationUrl(string redirectUri, string state)
        {
            var clientId = _settings.ResolvedClientId;
            if (string.IsNullOrEmpty(clientId))
            {
                throw new InvalidOperationException("Google ClientId is not configured.");
            }

            var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = new ClientSecrets
                {
                    ClientId = clientId,
                    ClientSecret = _settings.ResolvedClientSecret
                },
                Scopes = new[] { CalendarService.Scope.Calendar }
            });

            var requestUrl = new Google.Apis.Auth.OAuth2.Requests.GoogleAuthorizationCodeRequestUrl(new Uri(flow.AuthorizationServerUrl))
            {
                ClientId = clientId,
                RedirectUri = redirectUri,
                Scope = string.Join(" ", flow.Scopes),
                State = state,
                AccessType = "offline",
                ApprovalPrompt = "force"
            };

            return requestUrl.Build().ToString();
        }

        public async Task<bool> ExchangeCodeAndSaveTokenAsync(string code, string redirectUri, int userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var clientId = _settings.ResolvedClientId;
                var clientSecret = _settings.ResolvedClientSecret;

                var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = clientId,
                        ClientSecret = clientSecret
                    },
                    Scopes = new[] { CalendarService.Scope.Calendar }
                });

                var tokenResponse = await flow.ExchangeCodeForTokenAsync(
                    userId.ToString(),
                    code,
                    redirectUri,
                    cancellationToken
                );

                if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
                {
                    _logger.LogWarning("Google code exchange returned null or empty access token for user {UserId}", userId);
                    return false;
                }

                // Retrieve user's Google email address using the access token
                string googleEmail = "primary";
                try
                {
                    using var httpClient = new HttpClient();
                    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenResponse.AccessToken);
                    var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo", cancellationToken);
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync(cancellationToken);
                        using var jsonDoc = JsonDocument.Parse(content);
                        if (jsonDoc.RootElement.TryGetProperty("email", out var emailProp))
                        {
                            googleEmail = emailProp.GetString() ?? "primary";
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to retrieve Google email address for user {UserId} during callback", userId);
                }

                // Check if a token already exists for the user
                var existingToken = await _tokenRepository.GetQueryable()
                    .FirstOrDefaultAsync(t => t.UserId == userId, cancellationToken);

                var expirationTime = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresInSeconds ?? 3600);

                if (existingToken != null)
                {
                    existingToken.GoogleEmail = googleEmail;
                    existingToken.AccessToken = tokenResponse.AccessToken;
                    if (!string.IsNullOrEmpty(tokenResponse.RefreshToken))
                    {
                        existingToken.RefreshToken = tokenResponse.RefreshToken;
                    }
                    existingToken.TokenExpiration = expirationTime;
                    _tokenRepository.Update(existingToken);
                }
                else
                {
                    var newToken = new UserGoogleToken
                    {
                        UserId = userId,
                        GoogleEmail = googleEmail,
                        AccessToken = tokenResponse.AccessToken,
                        RefreshToken = tokenResponse.RefreshToken ?? string.Empty,
                        TokenExpiration = expirationTime
                    };
                    await _tokenRepository.AddAsync(newToken);
                }

                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Successfully saved Google Calendar OAuth token for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exchanging Google OAuth code for user {UserId}", userId);
                return false;
            }
        }

        public async Task<string> GetOrRefreshTokenAsync(int userId, CancellationToken cancellationToken = default)
        {
            var token = await _tokenRepository.GetQueryable()
                .FirstOrDefaultAsync(t => t.UserId == userId, cancellationToken);

            if (token == null)
            {
                throw new InvalidOperationException("Google Calendar is not integrated for this user.");
            }

            // If token is expired or expires in less than 5 minutes, refresh it
            if (token.TokenExpiration <= DateTime.UtcNow.AddMinutes(5))
            {
                if (string.IsNullOrEmpty(token.RefreshToken))
                {
                    throw new InvalidOperationException("Google Calendar integration needs to be reconnected (missing refresh token).");
                }

                _logger.LogInformation("Google access token for user {UserId} is expired or close to expiration. Refreshing...", userId);

                try
                {
                    var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = new ClientSecrets
                        {
                            ClientId = _settings.ResolvedClientId,
                            ClientSecret = _settings.ResolvedClientSecret
                        }
                    });

                    var tokenResponse = await flow.RefreshTokenAsync(
                        userId.ToString(),
                        token.RefreshToken,
                        cancellationToken
                    );

                    if (tokenResponse != null && !string.IsNullOrEmpty(tokenResponse.AccessToken))
                    {
                        token.AccessToken = tokenResponse.AccessToken;
                        token.TokenExpiration = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresInSeconds ?? 3600);
                        if (!string.IsNullOrEmpty(tokenResponse.RefreshToken))
                        {
                            token.RefreshToken = tokenResponse.RefreshToken;
                        }

                        _tokenRepository.Update(token);
                        await _unitOfWork.SaveChangesAsync();
                        _logger.LogInformation("Successfully refreshed Google Calendar OAuth token for user {UserId}", userId);
                    }
                    else
                    {
                        throw new InvalidOperationException("Failed to refresh Google Calendar OAuth token.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error refreshing Google OAuth token for user {UserId}", userId);
                    throw new InvalidOperationException("Unable to refresh Google Calendar connection.", ex);
                }
            }

            return token.AccessToken;
        }

        public async Task<bool> IsConnectedAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _tokenRepository.GetQueryable()
                .AnyAsync(t => t.UserId == userId, cancellationToken);
        }
    }
}
