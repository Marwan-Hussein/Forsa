using Application.Core.Interfaces;
using Application.Core.Interfaces.AttendeeInterfaces;
using Application.Core.Interfaces.Auth;
using Application.Core.Settings;
using Application.Services;
using Application.Services.AttendeeServices;
using Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Application Layer Services here. Example: AutoMapper, MediatR, FluentValidation, domain services.
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IBookingService, BookingService>();


        // Attendee Services
        services.AddScoped<IAttendeeAdminService,AttendeeAdminService>();
        services.AddScoped<IAttendeeProfileService,AttendeeProfileService>();

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
        });

        // Jwt Dependency Injection
        services.AddScoped<IJwtService, JwtService>();
        return services;
    }
}
