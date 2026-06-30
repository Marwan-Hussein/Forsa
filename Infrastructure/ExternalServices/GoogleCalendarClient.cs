using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Core.Settings;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Oauth2.v2;
using Google.Apis.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;

namespace Infrastructure.ExternalServices
{
    public class GoogleCalendarClient : IGoogleCalendarClient
    {
        private readonly GoogleAuthSettings _authSettings;
        private readonly GoogleCalendarSettings _calendarSettings;
        private readonly ILogger<GoogleCalendarClient> _logger;

        public GoogleCalendarClient(
            IOptions<GoogleAuthSettings> authSettings,
            IOptions<GoogleCalendarSettings> calendarSettings,
            ILogger<GoogleCalendarClient> logger)
        {
            _authSettings = authSettings.Value;
            _calendarSettings = calendarSettings.Value;
            _logger = logger;
        }

        private GoogleAuthorizationCodeFlow CreateFlow()
        {
            return new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = new ClientSecrets
                {
                    ClientId = _authSettings.ResolvedClientId,
                    ClientSecret = _authSettings.ResolvedClientSecret
                },
                Scopes = new[]
                {
                    CalendarService.Scope.Calendar,
                    Oauth2Service.Scope.UserinfoEmail,
                    Oauth2Service.Scope.UserinfoProfile
                }
            });
        }

        public string CreateAuthorizationUrl(string redirectUri, string state)
        {
            var flow = CreateFlow();
            var request = (GoogleAuthorizationCodeRequestUrl)flow.CreateAuthorizationCodeRequest(redirectUri);
            
            request.ResponseType = "code";
            request.State = state;
            request.IncludeGrantedScopes = "true";
            request.AccessType = "offline";
            request.Prompt = "consent";
            return request.Build().AbsoluteUri;
        }

        public async Task<GoogleAuthTokenDto> ExchangeCodeForTokenAsync(string code, string redirectUri, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Exchanging OAuth code for token. ClientId: '{ClientId}', Secret length: {SecretLength}, RedirectUri: '{RedirectUri}'",
                    _authSettings.ResolvedClientId,
                    _authSettings.ResolvedClientSecret?.Length ?? 0,
                    redirectUri);

                var flow = CreateFlow();
                var tokenResponse = await flow.ExchangeCodeForTokenAsync("user", code, redirectUri, cancellationToken);
                var expiresAtUtc = tokenResponse.IssuedUtc.AddSeconds(tokenResponse.ExpiresInSeconds ?? 0);

                return new GoogleAuthTokenDto
                {
                    AccessToken = tokenResponse.AccessToken,
                    RefreshToken = tokenResponse.RefreshToken,
                    IdToken = tokenResponse.IdToken,
                    TokenType = tokenResponse.TokenType,
                    ExpiresInSeconds = (int)(tokenResponse.ExpiresInSeconds ?? 0),
                    IssuedUtc = tokenResponse.IssuedUtc,
                    ExpiresAtUtc = expiresAtUtc
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to exchange authorization code for Google token.");
                throw;
            }
        }

        public async Task<GoogleAuthTokenDto> RefreshTokenAsync(GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var credential = CreateUserCredential(tokenDto);

                if (!await credential.RefreshTokenAsync(cancellationToken))
                {
                    throw new InvalidOperationException("Unable to refresh Google access token.");
                }

                var refreshedToken = credential.Token;
                var expiresAtUtc = refreshedToken.IssuedUtc.AddSeconds(refreshedToken.ExpiresInSeconds ?? 0);

                return new GoogleAuthTokenDto
                {
                    AccessToken = refreshedToken.AccessToken,
                    RefreshToken = refreshedToken.RefreshToken ?? tokenDto.RefreshToken,
                    IdToken = refreshedToken.IdToken,
                    TokenType = refreshedToken.TokenType,
                    ExpiresInSeconds = (int)(refreshedToken.ExpiresInSeconds ?? 0),
                    IssuedUtc = refreshedToken.IssuedUtc,
                    ExpiresAtUtc = expiresAtUtc
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to refresh Google access token.");
                throw;
            }
        }

        private UserCredential CreateUserCredential(GoogleAuthTokenDto tokenDto)
        {
            var response = new TokenResponse
            {
                AccessToken = tokenDto.AccessToken,
                RefreshToken = tokenDto.RefreshToken,
                IdToken = tokenDto.IdToken,
                TokenType = tokenDto.TokenType,
                ExpiresInSeconds = tokenDto.ExpiresInSeconds,
                IssuedUtc = tokenDto.IssuedUtc
            };

            return new UserCredential(CreateFlow(), "user", response);
        }

        public async Task<GoogleUserInfoDto> GetUserInfoAsync(GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default)
        {
            var credential = CreateUserCredential(tokenDto);
            var oauthService = new Oauth2Service(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = _calendarSettings.ApplicationName
            });

            var userInfo = await oauthService.Userinfo.Get().ExecuteAsync(cancellationToken);

            return new GoogleUserInfoDto
            {
                Email = userInfo.Email,
                Name = userInfo.Name
            };
        }

        private CalendarService CreateCalendarService(GoogleAuthTokenDto tokenDto)
        {
            var credential = CreateUserCredential(tokenDto);
            return new CalendarService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = _calendarSettings.ApplicationName
            });
        }

        private static Event MapToGoogleEvent(GoogleCalendarEventDto dto)
        {
            var timeZone = dto.TimeZone ?? "UTC";
            return new Event
            {
                Summary = dto.Title,
                Description = dto.Description,
                Location = dto.Location,
                Start = new EventDateTime
                {
                    DateTimeDateTimeOffset = dto.StartTime.ToUniversalTime(),
                    TimeZone = timeZone
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset = dto.EndTime.ToUniversalTime(),
                    TimeZone = timeZone
                }
            };
        }

        private static GoogleCalendarEventDto MapToDto(Event googleEvent)
        {
            return new GoogleCalendarEventDto
            {
                Title = googleEvent.Summary,
                Description = googleEvent.Description,
                Location = googleEvent.Location,
                StartTime = googleEvent.Start?.DateTimeDateTimeOffset?.DateTime ?? DateTime.MinValue,
                EndTime = googleEvent.End?.DateTimeDateTimeOffset?.DateTime ?? DateTime.MinValue,
                TimeZone = googleEvent.Start?.TimeZone
            };
        }

        public async Task<string> CreateEventAsync(string calendarId, GoogleCalendarEventDto eventDto, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var service = CreateCalendarService(tokenDto);
                var googleEvent = MapToGoogleEvent(eventDto);
                var request = service.Events.Insert(googleEvent, calendarId);
                var createdEvent = await request.ExecuteAsync(cancellationToken);
                return createdEvent.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GoogleCalendarClient failed to create event.");
                throw;
            }
        }

        public async Task UpdateEventAsync(string calendarId, string googleEventId, GoogleCalendarEventDto eventDto, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var service = CreateCalendarService(tokenDto);
                var googleEvent = MapToGoogleEvent(eventDto);
                var request = service.Events.Update(googleEvent, calendarId, googleEventId);
                await request.ExecuteAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GoogleCalendarClient failed to update event.");
                throw;
            }
        }

        public async Task DeleteEventAsync(string calendarId, string googleEventId, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var service = CreateCalendarService(tokenDto);
                var request = service.Events.Delete(calendarId, googleEventId);
                await request.ExecuteAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GoogleCalendarClient failed to delete event.");
                throw;
            }
        }

        public async Task<GoogleCalendarEventDto?> GetEventAsync(string calendarId, string googleEventId, GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var service = CreateCalendarService(tokenDto);
                var request = service.Events.Get(calendarId, googleEventId);
                var googleEvent = await request.ExecuteAsync(cancellationToken);
                return MapToDto(googleEvent);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GoogleCalendarClient failed to get event.");
                throw;
            }
        }
    }
}
