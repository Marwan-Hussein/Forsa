
using Application;
using Domain.Entities;
// using Forsa.Seed;
using Infrastructure;
using Infrastructure.Data.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using StackExchange.Redis;
using Application.Core.Interfaces.Auth.OTP;
using Application.Services.Auth.OTP;

namespace Forsa
{
    // if you want to create a local admin user, you can uncomment the commented code lines and run once the program
    public class Program
    {
        // public static async Task Main(string[] args)
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
           
            builder.Services.AddDbContext<ForsaDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>()
                            .AddEntityFrameworkStores<ForsaDbContext>()
                            .AddDefaultTokenProviders();

            // redis
            var redisConnection = builder.Configuration.GetConnectionString("Redis");
            builder.Services.AddSingleton<IConnectionMultiplexer>(sp=>
                {
                    var configuration = ConfigurationOptions.Parse(redisConnection);
                    configuration.AbortOnConnectFail = false; // This prevents the crash
                    return ConnectionMultiplexer.Connect(configuration);
                });
            builder.Services.AddScoped<IRedisCacheService, RedisCacheService>();

            // Add Frontend CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173") // Vite dev server port
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });



            // Add Google Auth Configuration 
            var google = builder.Configuration.GetSection("Authenication : Google");
            builder.Services.AddAuthentication()
                .AddGoogle(options => {
                    options.ClientId = google["ClientId"]!;
                    options.ClientSecret = google["ClientSecret"]!;
                    options.CallbackPath = "/signin-google";
                }
                );

            builder.Services.AddApplicationServices(builder.Configuration);
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
                //await LocalAdminSeeder.SeedAsync(app.Services);
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Active Cors Middleware
            // app.UseHttpsRedirection();
            app.UseCors("Frontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.Run();


        }
    }
}
