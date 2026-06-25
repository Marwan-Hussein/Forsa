
using Application;
using Application.Core.Interfaces.Auth.OTP;
using Application.Services.Auth.OTP;
using Domain.Entities;
using Forsa.Seed;
using Infrastructure;
using Infrastructure.Data.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;
using System.Text.Json.Serialization;
using Application.Validators;

namespace Forsa
{
    public class Program
    {
        // uncomment this and below in app.environment to run the seeder
        //public static async Task Main(string[] args)
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



            //// Add Google Auth Configuration 
            //var google = builder.Configuration.GetSection("Authentication:Google");
            //builder.Services.AddAuthentication(options => {
            //    options.DefaultScheme = IdentityConstants.ApplicationScheme;
            //    options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
            //}).AddGoogle(options =>
            //    {
            //        options.ClientId = google["GoogleId"]!;
            //        options.ClientSecret = google["GoogleSecret"]!;
            //        options.CallbackPath = "/signin-google";
            //    }
            //);

            builder.Services.AddApplicationServices(builder.Configuration);
            builder.Services.AddInfrastructureServices(builder.Configuration);

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());

                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                // uncomment this to run the seeder
                //DatabaseSeeder.SeedAsync(app.Services);
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
