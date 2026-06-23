namespace Application.Core.DTOs.Admin
{
    public class PerformanceReportDTO
    {
        // for an Organization / Place
        public int CompletedTasks { get; set; } // that may be event or booking a place
        public double AverageRatings { get; set; }
        public decimal TotalEarnings { get; set; }

    }
}