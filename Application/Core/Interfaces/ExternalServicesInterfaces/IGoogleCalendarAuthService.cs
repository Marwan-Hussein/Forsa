using Application.Core.DTOs.ExternalDTOs;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    public interface IGoogleCalendarAuthService
    {
        string GenerateAuthorizationUrl(string redirectUri, string state);
        Task<GoogleAuthTokenDto> ExchangeCodeForTokenAsync(string code, string redirectUri, CancellationToken cancellationToken = default);
        Task<GoogleUserInfoDto> GetUserInfoAsync(GoogleAuthTokenDto tokenDto, CancellationToken cancellationToken = default);
        Task SaveUserTokenAsync(int userId, GoogleAuthTokenDto tokenDto, string googleEmail, CancellationToken cancellationToken = default);
        Task<GoogleAuthTokenDto?> GetStoredUserTokenAsync(int userId, CancellationToken cancellationToken = default);
    }
}
