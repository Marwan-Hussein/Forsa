using Application.Authorization.Handlers;
using Application.Authorization.Requirements;
using MediatR;
using Application.Core.Interfaces;
using Application.Core.Interfaces.AttendeeInterfaces;
using Application.Core.Interfaces.Auth;
using Application.Core.Interfaces.Auth.OTP;
using Application.Core.Settings;
using Application.Services;
using Application.Services.AttendeeServices;
using Application.Services.Auth.OTP;
using Application.Services.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Application.Core.Interfaces.EventInterfaces;
using Application.Services.EventServices;
using Application.Core.Interfaces.PlaceInterfaces;
using Application.Services.PlaceServices;
using Application.Core.Interfaces.AdminServices;
using Application.Services.AdminServices;
using Application.Core.Interfaces.OwnerInterfaces;
using Application.Services.OwnerServices;
using Application.Core.Interfaces.OrganizerInterfaces;
using Application.Services.OrganizerServices;
using Application.Core.Interfaces.ExternalServicesInterfaces;
using Application.Services.ExternalServices;
using AutoMapper;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Application Layer Services here. Example: AutoMapper, MediatR, FluentValidation, domain services.
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddMediatR(typeof(DependencyInjection).Assembly);

        // Admin Services
        services.AddScoped<IAdminUserService, AdminUserService>();

        // Event Services
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IEventAdminService, EventAdminService>();

        // Place Services
        services.AddScoped<IPlaceAdminService, PlaceAdminService>();
        services.AddScoped<IPlaceMediaService, PlaceMediaService>();

        // Owner Services
        services.AddScoped<IOwnerService, OwnerService>();
        services.AddScoped<IPlaceOwnerService, PlaceOwnerService>();
        services.AddScoped<IPlaceAvailabilityService, PlaceAvailabilityService>();
        services.AddScoped<IBookingRequestOwnerService, BookingRequestOwnerService>();
        services.AddScoped<IOwnerFeedbackService, OwnerFeedbackService>();

        // Booking Services
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IQrService, QrService>();

        // Attendee Services
        services.AddScoped<IAttendeeAdminService,AttendeeAdminService>();
        services.AddScoped<IAttendeeProfileService,AttendeeProfileService>();
        services.AddScoped<IAttendeeFeedbackService, AttendeeFeedbackService>();
        services.AddScoped<IAttendeeBookingService, AttendeeBookingService>();
        services.AddScoped<IWishlistService, WishlistService>();

        // Organizer Services
        services.AddScoped<IOrganizerService, OrganizerService>();

        // Promo Services
        services.AddScoped<IPromoService, PromoCodeService>();

        // User Profile Services (generic for all roles)
        services.AddScoped<IUserProfileService, UserProfileService>();

        // Jwt Configuration
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(o =>
        {
            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = configuration["JwtSettings:Issuer"],
                ValidAudience = configuration["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:Key"]))
            };
        });
        
        // Authorization Policies
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            options.AddPolicy("AttendeeOnly", policy => policy.RequireRole("Attendee"));
            options.AddPolicy("OwnerOnly", policy => policy.RequireRole("Owner"));
            options.AddPolicy("OrganizerOnly", policy => policy.RequireRole("Organizer"));
            options.AddPolicy("AuthenticatedUser", policy => policy.RequireAuthenticatedUser());

            options.AddPolicy("BookingOwnerOrAdmin", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.AddRequirements(new ResourceOwnerRequirement());
            });
        });

        // Register HttpContextAccessor for handlers
        services.AddHttpContextAccessor();
        
        // Register Authorization Handlers
        services.AddScoped<IAuthorizationHandler, BookingOwnerHandler>();

        // Jwt Dependency Injection
        services.AddScoped<IJwtService, JwtService>();

        // Email Settings Configuration
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));

        // OTP Services
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IOTPService, OTPService>();

        // Refresh Token Services
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();

        // IAuth Services
        services.AddScoped<IAuthService, AuthService>();

        // Google Services
        services.Configure<GoogleAuthSettings>(configuration.GetSection("Authentication:Google"));

        // Google Calendar Services
        services.Configure<GoogleCalendarSettings>(configuration.GetSection("GoogleCalendar"));
        services.AddScoped<IGoogleCalendarService, GoogleCalendarService>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();

        return services;
    }
}

