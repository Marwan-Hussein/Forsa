using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Infrastructure Layer Services here. Example: DbContexts, Repositories, external clients.
        services.AddScoped<Domain.Interfaces.IUnitOfWork, Infrastructure.Data.UnitOfWork>();
        services.AddScoped(typeof(Domain.Interfaces.IGenericRepository<>), typeof(Infrastructure.Repositories.GenericRepository<>));
        services.AddScoped(typeof(Domain.Interfaces.IQueryableRepository<>), typeof(Infrastructure.Repositories.QueryableRepository<>));
        services.AddScoped<Domain.Interfaces.IEventRepository, Infrastructure.Repositories.EventRepository>();

        // Attendee 
        services.AddScoped<Domain.Interfaces.AttendeeInterfaces.IAttendeeRepository, Infrastructure.Repositories.AttendeeRepos.AttendeeRepository>();
        services.AddScoped<Domain.Interfaces.AttendeeInterfaces.IAttendeeProfileRepository, Infrastructure.Repositories.AttendeeRepos.AttendeeProfileRepository>();
        return services;
    }
}
