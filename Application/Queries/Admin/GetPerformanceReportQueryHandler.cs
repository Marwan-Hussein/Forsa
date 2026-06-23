using Application.Core.DTOs.Admin;
using Application.Core.Interfaces;
using MediatR;

namespace Application.Queries.Admin
{
    public class GetPerformanceReportQueryHandler
        : IRequestHandler<GetPerformanceReportQuery, PerformanceReportDTO>
    {
        private readonly IReportsRepository _repo;
        public GetPerformanceReportQueryHandler(IReportsRepository repo)
        {
            _repo = repo;
        }

        public async Task<PerformanceReportDTO> Handle(
            GetPerformanceReportQuery request, 
            CancellationToken cancellationToken)
        {
            return await _repo.GetPerformanceReportAsync(
                request.From, 
                request.To
                );
        }
    }
}
