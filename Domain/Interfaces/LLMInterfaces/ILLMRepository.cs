using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.LLMInterfaces
{
    public interface ILLMRepository
    {
        Task<string> SearchPlatformRegistryAsync(string searchType, string keyword, string location, string date);
        Task<string> GetEntityDetailedProfileAsync(string entityType, string entityIdentifier);
        Task<string> GetLiveInventoryAsync(int eventId);
        Task<string> GetUserHistoryAndStatusAsync(string userId);
        Task<string> GetPlatformOverviewStatsAsync();
    }
}
