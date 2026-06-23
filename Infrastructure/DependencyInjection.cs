using Application.Core.Interfaces.Auth;
using Application.Core.Interfaces;
using Application.Services.Auth;
using Domain.Interfaces;
using Domain.Interfaces.AttendeeInterfaces;
using Domain.Interfaces.OwnerInterfaces;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Repositories.AttendeeRepos;
using Infrastructure.Repositories.OwnerRepos;
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
        services.AddScoped<IPromoCodeRepository, PromoCodeRepository>();
        // Attendee 
        services.AddScoped<IAttendeeRepository, AttendeeRepository>();
        services.AddScoped<IAttendeeProfileRepository,AttendeeProfileRepository>();

        // Owner
        services.AddScoped<IOwnerRepository, OwnerRepository>();

        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IPlaceRepository, PlaceRepository>();
        services.AddScoped<IReportsRepository, ReportsRepository>();

        return services;
    }
}
