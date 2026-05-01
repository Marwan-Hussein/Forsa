using Application.Core.Interfaces.Auth;
using StackExchange.Redis;
using System.Text.Json;

namespace Application.Services.Auth
{
    public class RedisCacheService : IRedisCacheService
    {
        private readonly IDatabase _database;

        public RedisCacheService(IConnectionMultiplexer redis)
        {
            // connect to the default db (0)
            _database = redis.GetDatabase();
        }
        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            string jsonData = JsonSerializer.Serialize(value, options);
            await _database.StringSetAsync(key, jsonData, expiry);
        }
        public async Task<T?> GetAsync<T>(string key)
        {
            var data = await _database.StringGetAsync(key);
            if (data.IsNullOrEmpty)
                return default;
            return JsonSerializer.Deserialize<T>(data);
        }

        public async Task RemoveAsync(string key)
        {
            await _database.KeyDeleteAsync(key);
        }

    }
}
