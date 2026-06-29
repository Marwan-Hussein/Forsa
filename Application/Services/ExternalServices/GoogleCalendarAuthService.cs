using Application.Core.DTOs.ExternalDTOs;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Domain.Entities.AuthEntities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Services.ExternalServices
{
    public class GoogleCalendarAuthService : IGoogleCalendarAuthService
    {
        private readonly IGoogleCalendarClient _googleCalendarClient;
        private readonly IQueryableRepository<UserGoogleToken> _userGoogleTokenRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<GoogleCalendarAuthService> _logger;

        public GoogleCalendarAuthService(
            IGoogleCalendarClient googleCalendarClient,
            IQueryableRepository<UserGoogleToken> userGoogleTokenRepository,
            IUnitOfWork unitOfWork,
            ILogger<GoogleCalendarAuthService> logger)
        {
            _googleCalendarClient = googleCalendarClient;
            _userGoogleTokenRepository = userGoogleTokenRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public string GenerateAuthorizationUrl(string redirectUri, string state)
        {
            return _googleCalendarClient.CreateAuthorizationUrl(redirectUri, state);
        }

        public Task<GoogleAuthTokenDto> ExchangeCodeForTokenAsync(string code, string redirectUri, CancellationToken cancellationToken = default)
        {
            return _googleCalendarClient.ExchangeCodeForTokenAsync(code, redirectUri, cancellationToken);
        }

        public Task<GoogleUserInfoDto> GetUserInfoAsync(GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default)
        {
            return _googleCalendarClient.GetUserInfoAsync(tokenDto, cancellationToken);
        }

        public async Task SaveUserTokenAsync(int userId, GoogleAuthTokenDto tokenDto, string googleEmail, CancellationToken cancellationToken = default)
        {
            var existingToken = await _userGoogleTokenRepository.GetQueryable()
                .SingleOrDefaultAsync(t => t.UserId == userId, cancellationToken);

            if (existingToken == null)
            {
                await _userGoogleTokenRepository.AddAsync(new UserGoogleToken
                {
                    UserId = userId,
                    GoogleEmail = googleEmail,
                    AccessToken = tokenDto.AccessToken,
                    RefreshToken = tokenDto.RefreshToken,
                    TokenExpiration = tokenDto.ExpiresAtUtc
                });
            }
            else
            {
                existingToken.GoogleEmail = googleEmail;
                existingToken.AccessToken = tokenDto.AccessToken;
                if (!string.IsNullOrWhiteSpace(tokenDto.RefreshToken))
                {
                    existingToken.RefreshToken = tokenDto.RefreshToken;
                }
                existingToken.TokenExpiration = tokenDto.ExpiresAtUtc;
                _userGoogleTokenRepository.Update(existingToken);
            }

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<GoogleAuthTokenDto?> GetStoredUserTokenAsync(int userId, CancellationToken cancellationToken = default)
        {
            var token = await _userGoogleTokenRepository.GetQueryable()
                .SingleOrDefaultAsync(t => t.UserId == userId, cancellationToken);

            if (token == null)
                return null;

            return new GoogleAuthTokenDto
            {
                AccessToken = token.AccessToken,
                RefreshToken = token.RefreshToken,
                ExpiresAtUtc = token.TokenExpiration,
                IssuedUtc = token.TokenExpiration.AddSeconds(-1 * 3600) // best-effort; not persisted
            };
        }
    }
}
