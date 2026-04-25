using Microsoft.Extensions.DependencyInjection;
using FluentValidation;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Add Application Layer Services here. Example: AutoMapper, MediatR, FluentValidation, domain services.
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<Application.Core.Interfaces.IEventService, Application.Services.EventService>();
        services.AddScoped<Application.Core.Interfaces.IBookingService, Application.Services.BookingService>();

        // Attendee Services
        services.AddScoped<Application.Core.Interfaces.AttendeeInterfaces.IAttendeeAdminService, Application.Services.AttendeeServices.AttendeeAdminService>();
        services.AddScoped<Application.Core.Interfaces.AttendeeInterfaces.IAttendeeProfileService, Application.Services.AttendeeServices.AttendeeProfileService>();
        return services;
    }
}
