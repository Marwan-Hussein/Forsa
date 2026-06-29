using Application.Core.Interfaces;
using Application.Core.Interfaces.Auth;
using Application.Core.Interfaces.OrganizerInterfaces;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Services.Auth;
using Application.Services.OrganizerServices;
using Domain.Interfaces;
using Domain.Interfaces.AttendeeInterfaces;
using Domain.Interfaces.BookingInterfaces;
using Domain.Interfaces.LLMInterfaces;
using Domain.Interfaces.OrganizerInterfaces;
using Domain.Interfaces.OwnerInterfaces;
using Infrastructure.Data;
using Infrastructure.ExternalServices;
using Infrastructure.Repositories;
using Infrastructure.Repositories.AttendeeRepos;
using Infrastructure.Repositories.BookingRepos;
using Infrastructure.Repositories.LLM;
using Infrastructure.Repositories.OrganizerRepos;
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
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IExternalAuthService, ExternalAuthService>();
        services.AddScoped<IPromoCodeRepository, PromoCodeRepository>();
        // Attendee 
        services.AddScoped<IAttendeeRepository, AttendeeRepository>();
        services.AddScoped<IAttendeeProfileRepository, AttendeeProfileRepository>();

        // Owner
        services.AddScoped<IOwnerRepository, OwnerRepository>();

        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IPlaceRepository, PlaceRepository>();
        services.AddScoped<IReportsRepository, ReportsRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();

        // Organizer Services
        services.AddScoped<IOrganizerRepository, OrgainzerRepository>();

        // Promo Services
        services.AddScoped<IPromoCodeRepository, PromoCodeRepository>();

        // Google Calendar Infrastructure
        services.AddScoped<IGoogleCalendarClient, GoogleCalendarClient>();
        // LLM Services
        services.AddScoped<ILLMRepository, LLMRepository>();

        // Booking Services
        services.AddScoped<IBookingRepository, BookingRepository>();

        return services;
    }
}
