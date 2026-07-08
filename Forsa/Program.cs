
using Application;
using Application.Core.Interfaces;
using Forsa.Hubs;
using Application.Core.Interfaces.Auth.OTP;
using Application.Services.Auth.OTP;
using Application.Services.LLMServices;
using Domain.Entities;
using Domain.Interfaces.LLMInterfaces;
using Forsa.Services;
using Forsa.Seed;
using Infrastructure;
using Infrastructure.Data.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using StackExchange.Redis;
using System.Text.Json;
using System.Text.Json.Serialization;
namespace Forsa
{
    public class Program
    {
        // uncomment this and below in app.environment to run the seeder
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
           
            builder.Services.AddDbContext<ForsaDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>()
                            .AddEntityFrameworkStores<ForsaDbContext>()
                            .AddDefaultTokenProviders();
            // comment
            //// redis
            //var redisConnection = builder.Configuration.GetConnectionString("Redis");
            //builder.Services.AddSingleton<IConnectionMultiplexer>(sp=>
            //    {
            //        var configuration = ConfigurationOptions.Parse(redisConnection);
            //        configuration.AbortOnConnectFail = false; // This prevents the crash
            //        return ConnectionMultiplexer.Connect(configuration);
            //    });
            //builder.Services.AddScoped<IRedisCacheService, RedisCacheService>();
            var redisConnection = builder.Configuration.GetConnectionString("Redis");
            if (!string.IsNullOrWhiteSpace(redisConnection))
            {
                builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
                {
                    var configuration = ConfigurationOptions.Parse(redisConnection);
                    configuration.AbortOnConnectFail = false;
                    return ConnectionMultiplexer.Connect(configuration);
                });

                builder.Services.AddScoped<IRedisCacheService, RedisCacheService>();
            }

            // Add Frontend CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173") // Vite dev server port
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });



            //// Add Google Auth Configuration 
            var google = builder.Configuration.GetSection("Authentication:Google");
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = IdentityConstants.ApplicationScheme;
                options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
            })
            .AddCookie()
            .AddGoogle(options =>
                {
                    options.ClientId = google["GoogleId"]!;
                    options.ClientSecret = google["GoogleSecret"]!;
                    options.CallbackPath = "/signin-google";
                }
            );

            builder.Services.AddApplicationServices(builder.Configuration);
            builder.Services.AddInfrastructureServices(builder.Configuration);
            builder.Services.AddSignalR();
            builder.Services.AddScoped<INotifierService, SignalRNotifierService>();

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());

                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme. Just paste your token directly here, the 'Bearer ' prefix will be added automatically."
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped(sp =>
            {
                var config = sp.GetRequiredService<IConfiguration>();
                var modelId = config["LLM:ModelId"];
                var apiKey = config["LLM:APIKey"];
                var kernelBuilder = Kernel.CreateBuilder();

                kernelBuilder.AddGoogleAIGeminiChatCompletion(modelId, apiKey);

                var LLMRepo = sp.GetRequiredService<ILLMRepository>();
                var httpAccessor = sp.GetRequiredService<IHttpContextAccessor>();
                var forsaPlugin = new ForsaSystemPlugin(LLMRepo, httpAccessor);

                kernelBuilder.Plugins.AddFromObject(forsaPlugin, "ForsaSystemPlugin");

                return kernelBuilder.Build();
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                //await DatabaseSeeder.SeedAsync(app.Services);
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Enable serving static files (for uploaded images in wwwroot)
            app.UseStaticFiles();

            // Active Cors Middleware
            app.UseHttpsRedirection();
            app.UseCors("Frontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapHub<NotificationsHub>("/hubs/notifications");
            app.MapControllers();
            app.MapFallbackToFile("index.html");
            app.Run();
        }
    }
}
