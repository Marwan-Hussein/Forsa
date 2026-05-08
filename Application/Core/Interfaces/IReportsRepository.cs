using Application.Core.DTOs.Admin;

namespace Application.Core.Interfaces
{
    public interface IReportsRepository
    {
        Task<PerformanceReportDTO> GetPerformanceReportAsync(
            DateTime from,
            DateTime to
            );
    }
}
