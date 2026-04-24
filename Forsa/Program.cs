using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces;
using Application.Core.Interfaces.AttendeeInterfaces;
using Application.Services;
using Application.Services.AttendeeServices;
using Application.Validators.Attendee;
using Domain.Interfaces;
using Domain.Interfaces.AttendeeInterfaces;
using FluentValidation;
using Infrastructure.Data.DbContexts;
using Infrastructure.Repositories;
using Infrastructure.Data;
using Application.Mapping;
using Application.Validators;

using Infrastructure.Repositories.AttendeeRepos;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Application;
using Infrastructure;
namespace Forsa
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddDbContext<ForsaDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add Frontend CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            builder.Services.AddApplicationServices();
            builder.Services.AddInfrastructureServices(builder.Configuration);

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("Frontend");

            app.UseAuthorization();


            app.MapControllers();

            app.Run();


        }
    }
}
