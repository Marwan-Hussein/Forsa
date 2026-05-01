using Domain.Entities.AuthEntities;

namespace Application.Core.Interfaces.Auth
{
    public interface IRefreshTokenService
    {
        string GenerateToken();
        RefreshToken CreateRefreshToken(string token);
    }
}
