using Application.Core.DTOs.Admin;
using MediatR;

namespace Application.Queries.Admin
{
    public record GetPerformanceReportQuery(
        DateTime From,
        DateTime To
        ): IRequest<PerformanceReportDTO>;
}
