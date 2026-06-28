using Application.Core.DTOs.Admin;

namespace Application.Core.Interfaces.AdminInterfaces
{
    public interface IAdminDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
