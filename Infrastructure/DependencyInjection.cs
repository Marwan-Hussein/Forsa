using Application.Core.Interfaces.Auth;
using Application.Services.Auth;
using Domain.Interfaces;
using Domain.Interfaces.AttendeeInterfaces;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Repositories.AttendeeRepos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Infrastructure Layer Services here. Example: DbContexts, Repositories, external clients.
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped(typeof(IQueryableRepository<>), typeof(QueryableRepository<>));
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IAuthService,AuthService>();
        services.AddScoped<IExternalAuthService, ExternalAuthService>();
        // Attendee 
        services.AddScoped<IAttendeeRepository, AttendeeRepository>();
        services.AddScoped<IAttendeeProfileRepository,AttendeeProfileRepository>();

        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IPlaceRepository, PlaceRepository>();
        services.AddScoped<IReportsRepository, ReportsRepository>();

        return services;
    }
}
