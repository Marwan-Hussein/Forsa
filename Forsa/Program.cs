using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;
using Application.Core.Interfaces;
using Application.Services;
using Infrastructure.Repositories;
using Infrastructure.Data;
using Domain.Interfaces;
using Application.Mapping;
using FluentValidation;
using Application.Validators;

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
            builder.Services.AddAutoMapper(cfg => 
            {
                cfg.AddProfile<Application.Mapping.EventProfile>();
                cfg.AddProfile<Application.Mapping.BookingProfile>();
            });

            // Register FluentValidation validators
            builder.Services.AddValidatorsFromAssemblyContaining<CreateBookingValidator>();

            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<IBookingService, BookingService>();
            builder.Services.AddScoped(typeof(IGenericService<>), typeof(GenericService<>));
            builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            builder.Services.AddControllers();
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
