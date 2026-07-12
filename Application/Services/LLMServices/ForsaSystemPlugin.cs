using Domain.Interfaces;
using Domain.Interfaces.LLMInterfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.SemanticKernel;
using System;
using System.ComponentModel;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Application.Services.LLMServices
{
    public class ForsaSystemPlugin
    {
        private readonly ILLMRepository _LLMRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ForsaSystemPlugin(ILLMRepository LLMRepository, IHttpContextAccessor httpContextAccessor)
        {
            _LLMRepository = LLMRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        [KernelFunction, Description("Searches the Forsa platform for available events or venues based on flexible search criteria.")]
        public async Task<string> SearchPlatformRegistry(
            [Description("The literal and mandatory search type: Use 'events' for concerts/events, or 'venues' for hosting places/halls.")] string searchType,
            [Description("Optional keyword or category such as: entertainment, technology, sports.")] string keyword = "",
            [Description("Optional location, city, or governorate of the event or venue.")] string location = "",
            [Description("Optional expected event date in YYYY-MM-DD format.")] string date = "")
        {
            try
            {
                return await _LLMRepository.SearchPlatformRegistryAsync(searchType, keyword, location, date);
            }
            catch (Exception ex)
            {
                return $"System notice: Unable to access the registry at this moment. Error: {ex.Message}";
            }
        }

        [KernelFunction, Description("Retrieves the full profile and detailed information of a specific entity (event or venue) using its name.")]
        public async Task<string> GetEntityDetailedProfile(
            [Description("The literal and mandatory entity type: 'event' or 'venue'.")] string entityType,
            [Description("The actual name of the entity to lookup details for.")] string entityIdentifier)
        {
            try
            {
                return await _LLMRepository.GetEntityDetailedProfileAsync(entityType, entityIdentifier);
            }
            catch (Exception ex)
            {
                return $"System notice: Unable to retrieve profile at this moment. Error: {ex.Message}";
            }
        }

        [KernelFunction, Description("Checks real-time inventory and live metrics (remaining tickets, capacity, sales, revenues) for a specific event. Restricted to Organizers and Admins only.")]
        public async Task<string> CheckLiveInventory(
            [Description("The unique integer ID of the event.")] int eventId)
        {
            try
            {
                var user = _httpContextAccessor.HttpContext?.User;
                var userRole = user?.FindFirst(ClaimTypes.Role)?.Value;

                if (userRole != "Organizer" && userRole != "Admin")
                    return "Access denied. This financial data is highly sensitive and restricted to Organizers and Platform Administrators only.";

                return await _LLMRepository.GetLiveInventoryAsync(eventId);
            }
            catch (Exception ex)
            {
                return $"System notice: Unable to check inventory at this moment. Error: {ex.Message}";
            }
        }

        [KernelFunction, Description("Retrieves the personal transaction history, recent tickets, bookings, and account status of the currently logged-in user.")]
        public async Task<string> GetUserActionStatus()
        {
            try
            {
                var user = _httpContextAccessor.HttpContext?.User;
                var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                    return "You appear to be unauthenticated. Please log in to view your personal tickets and active reservations.";

                return await _LLMRepository.GetUserHistoryAndStatusAsync(userId);
            }
            catch (Exception ex)
            {
                return $"System notice: Unable to retrieve user status at this moment. Error: {ex.Message}";
            }
        }

        [KernelFunction, Description("Retrieves overall system statistics and high-level administrative reports for the Forsa platform (e.g., total sales, event count, total tickets). Restricted to Admins only.")]
        public async Task<string> GetPlatformOverviewStats()
        {
            try
            {
                var user = _httpContextAccessor.HttpContext?.User;
                var userRole = user?.FindFirst(ClaimTypes.Role)?.Value;

                if (userRole != "Admin")
                {
                    return "Access denied. This is a sensitive administrative tool restricted strictly to Platform Administrators (Admin) only.";
                }

                return await _LLMRepository.GetPlatformOverviewStatsAsync();
            }
            catch (Exception ex)
            {
                return $"System notice: Unable to retrieve platform statistics at this moment. Error: {ex.Message}";
            }
        }
    }
}