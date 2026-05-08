using Application.Core.DTOs.Admin;

namespace Application.Queries.Admin
{
    public static class GetPerformanceReportQueryHandler
    {
        public static IQueryable<PerformanceReportDTO> PerfomanceMetrics(
            this IQueryable<PerformanceReportDTO> query, Func<PerformanceReportDTO, bool> fnc)
        {
            return query
                .Where(report => report.CompletedTasks > 0)
                .Where(report => report.AverageRatings < 2.5)
                .Select(report => new PerformanceReportDTO
                {
                    CompletedTasks = report.CompletedTasks,
                    AverageRatings = report.AverageRatings,
                    TotalEarnings = report.TotalEarnings
                })
                .OrderBy(report => fnc);
        }
    }
}