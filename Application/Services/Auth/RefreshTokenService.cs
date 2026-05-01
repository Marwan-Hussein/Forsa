using Application.Core.Interfaces.Auth;
using Application.Core.Settings;
using Domain.Entities.AuthEntities;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

namespace Application.Services.Auth
{
    public class RefreshTokenService(IOptions<JwtSettings> jwtSettings) : IRefreshTokenService
    {
        private readonly JwtSettings _jwtSettings = jwtSettings.Value;

        public string GenerateToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes);
        }

        public RefreshToken CreateRefreshToken(string token)
        {
            return new RefreshToken
            {
                Token = token,
                ExpiresOn = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDurationInDays),
                CreatedOn = DateTime.UtcNow
            };
        }
    }
}
