using Application.Core.DTOs.Owner;

namespace Application.Core.Interfaces.OwnerInterfaces
{
    public interface IOwnerDashboardService
    {
        Task<OwnerDashboardDto> GetOwnerDashboardStatsAsync(int ownerId);
    }
}
