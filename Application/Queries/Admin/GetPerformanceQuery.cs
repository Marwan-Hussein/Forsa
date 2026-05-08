using Application.Core.DTOs.Admin;
using MediatR;

namespace Application.Queries.Admin
{
    public record GetPerformanceQuery(
        DateTime From,
        DateTime To
        ): IRequest<PerformanceReportDTO>;
}
