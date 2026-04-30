namespace Application.Core.Interfaces.Auth
{
    internal interface IRedisCacheService
    {
        Task SetAsync(string key, string value, TimeSpan? expiry);
        Task<string?> GetAsync(string key);
        Task RemoveAsync(string key);
    }
}
