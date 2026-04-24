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
using Infrastructure.Repositories.AttendeeRepos;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
namespace Forsa
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddDbContext<ForsaDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add services to the container.
            builder.Services.AddScoped(typeof(IGenericService<>), typeof(GenericService<>));
            builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            builder.Services.AddScoped(typeof(IAttendeeProfileService), typeof(AttendeeProfileService));
            builder.Services.AddScoped(typeof(IAttendeeProfileRepository), typeof(AttendeeProfileRepository));
            builder.Services.AddScoped<IValidator<UpdateAttendeeInterestsDto>, UpdateAttendeeInterestsDtoValidator>();
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

            app.UseAuthorization();


            app.MapControllers();

            app.Run();


        }
    }
}
