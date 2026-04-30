using Application.Core.Interfaces;
using Application.Core.Interfaces.AttendeeInterfaces;
using Application.Services;
using Application.Services.AttendeeServices;
using Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Add Application Layer Services here. Example: AutoMapper, MediatR, FluentValidation, domain services.
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IBookingService, BookingService>();


        // Attendee Services
        services.AddScoped<IAttendeeAdminService,AttendeeAdminService>();
        services.AddScoped<IAttendeeProfileService,AttendeeProfileService>();
        return services;
    }
}
