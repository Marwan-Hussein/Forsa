using System.Threading;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.ExternalServicesInterfaces
{
    public interface IGoogleAuthService
    {
        string GetAuthorizationUrl(string redirectUri, string state);
        Task<bool> ExchangeCodeAndSaveTokenAsync(string code, string redirectUri, int userId, CancellationToken cancellationToken = default);
        Task<string> GetOrRefreshTokenAsync(int userId, CancellationToken cancellationToken = default);
        Task<bool> IsConnectedAsync(int userId, CancellationToken cancellationToken = default);
    }
}
