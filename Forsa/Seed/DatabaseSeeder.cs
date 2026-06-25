using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Entities.AdminEntities;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Infrastructure.Data.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Forsa.Seed
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ForsaDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

            // Ensure database is created/migrated
            await context.Database.MigrateAsync();

            // 1. Seed Roles
            var roles = new[] { "Admin", "Attendee", "Organizer", "Owner" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    var roleResult = await roleManager.CreateAsync(new IdentityRole<int>(role));
                    ThrowIfFailed(roleResult, $"Failed to create {role} role");
                }
            }

            // 2. Seed Organization Types
            var orgTypes = new List<OrganizationType>();
            if (!await context.Set<OrganizationType>().AnyAsync())
            {
                orgTypes.AddRange(new[]
                {
                    new OrganizationType { Name = "Technology Innovators", Description = "Tech-focused organizations", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new OrganizationType { Name = "Business Alliance", Description = "Business and networking groups", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new OrganizationType { Name = "Educational Institutions", Description = "Schools, universities, and training centers", IsActive = true, CreatedAt = DateTime.UtcNow }
                });
                await context.Set<OrganizationType>().AddRangeAsync(orgTypes);
                await context.SaveChangesAsync();
            }
            else
            {
                orgTypes = await context.Set<OrganizationType>().ToListAsync();
            }

            // 3. Seed Attendee Interests
            var interests = new List<AttendeeInterest>();
            if (!await context.Set<AttendeeInterest>().AnyAsync())
            {
                interests.AddRange(new[]
                {
                    new AttendeeInterest { InterestName = "Technology", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Business", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Education", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Sports", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Music", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Art", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Health", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Travel", CreatedAt = DateTime.UtcNow }
                });
                await context.Set<AttendeeInterest>().AddRangeAsync(interests);
                await context.SaveChangesAsync();
            }
            else
            {
                interests = await context.Set<AttendeeInterest>().ToListAsync();
            }

            // 4. Seed Users
            // A. Seed Admin
            const string adminEmail = "admin@forsa.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                var admin = new Admin
                {
                    FullName = "System Admin",
                    UserName = adminEmail,
                    NormalizedUserName = adminEmail.ToUpperInvariant(),
                    Email = adminEmail,
                    NormalizedEmail = adminEmail.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01000000000",
                    Location = "Cairo, Egypt",
                    BirthDate = new DateTime(2000, 1, 1),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(admin, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Admin user");
                await userManager.AddToRoleAsync(admin, "Admin");
            }

            // B. Seed Organizer
            const string organizerEmail = "organizer@forsa.com";
            var organizerUser = await userManager.FindByEmailAsync(organizerEmail) as Organizer;
            if (organizerUser == null)
            {
                var organizer = new Organizer
                {
                    FullName = "Test Organizer",
                    UserName = organizerEmail,
                    NormalizedUserName = organizerEmail.ToUpperInvariant(),
                    Email = organizerEmail,
                    NormalizedEmail = organizerEmail.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01100000000",
                    Location = "Cairo, Egypt",
                    BirthDate = new DateTime(1990, 5, 15),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    OrganizationName = "Tech Summit Org",
                    AverageRating = 4.8,
                    ReviewsCount = 10
                };
                var createResult = await userManager.CreateAsync(organizer, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Organizer user");
                await userManager.AddToRoleAsync(organizer, "Organizer");
                organizerUser = organizer;

                // Add to OrganiztionTypeWithOrganizer
                if (orgTypes.Any())
                {
                    await context.Set<OrganiztionTypeWithOrganizer>().AddAsync(new OrganiztionTypeWithOrganizer
                    {
                        OrganizerId = organizer.Id,
                        OrganizationTypeId = orgTypes.First().Id
                    });
                    await context.SaveChangesAsync();
                }
            }

            // C. Seed Owner
            const string ownerEmail = "owner@forsa.com";
            var ownerUser = await userManager.FindByEmailAsync(ownerEmail) as Owner;
            if (ownerUser == null)
            {
                var owner = new Owner
                {
                    FullName = "Test Owner",
                    UserName = ownerEmail,
                    NormalizedUserName = ownerEmail.ToUpperInvariant(),
                    Email = ownerEmail,
                    NormalizedEmail = ownerEmail.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01200000000",
                    Location = "Alexandria, Egypt",
                    BirthDate = new DateTime(1985, 10, 20),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(owner, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Owner user");
                await userManager.AddToRoleAsync(owner, "Owner");
                ownerUser = owner;
            }

            // D. Seed Attendees
            const string attendeeEmail1 = "attendee1@forsa.com";
            var attendeeUser1 = await userManager.FindByEmailAsync(attendeeEmail1) as Attendee;
            if (attendeeUser1 == null)
            {
                var attendee = new Attendee
                {
                    FullName = "Test Attendee One",
                    UserName = attendeeEmail1,
                    NormalizedUserName = attendeeEmail1.ToUpperInvariant(),
                    Email = attendeeEmail1,
                    NormalizedEmail = attendeeEmail1.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01500000001",
                    Location = "Giza, Egypt",
                    BirthDate = new DateTime(1995, 3, 25),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    LoyaltyPoint = 50
                };
                var createResult = await userManager.CreateAsync(attendee, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Attendee 1 user");
                await userManager.AddToRoleAsync(attendee, "Attendee");
                attendeeUser1 = attendee;

                // Bind interests
                if (interests.Any())
                {
                    await context.Set<AttendeeInterestesWithAttendee>().AddRangeAsync(
                        new AttendeeInterestesWithAttendee { AttendeeId = attendee.Id, AttendeeInterestId = interests[0].Id },
                        new AttendeeInterestesWithAttendee { AttendeeId = attendee.Id, AttendeeInterestId = interests[1].Id }
                    );
                    await context.SaveChangesAsync();
                }
            }

            const string attendeeEmail2 = "attendee2@forsa.com";
            var attendeeUser2 = await userManager.FindByEmailAsync(attendeeEmail2) as Attendee;
            if (attendeeUser2 == null)
            {
                var attendee = new Attendee
                {
                    FullName = "Test Attendee Two",
                    UserName = attendeeEmail2,
                    NormalizedUserName = attendeeEmail2.ToUpperInvariant(),
                    Email = attendeeEmail2,
                    NormalizedEmail = attendeeEmail2.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01500000002",
                    Location = "Mansoura, Egypt",
                    BirthDate = new DateTime(1998, 8, 12),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    LoyaltyPoint = 100
                };
                var createResult = await userManager.CreateAsync(attendee, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Attendee 2 user");
                await userManager.AddToRoleAsync(attendee, "Attendee");
                attendeeUser2 = attendee;
            }

            // 5. Seed Places (owned by Owner)
            var places = new List<Place>();
            if (!await context.Set<Place>().AnyAsync() && ownerUser != null)
            {
                places.AddRange(new[]
                {
                    new Place
                    {
                        Name = "Main Hall, Tech Center",
                        Location = "Tech Park, Cairo",
                        Capacity = 500,
                        Description = "Large high-tech hall suitable for conferences and workshops.",
                        HourlyPrice = 50.00m,
                        DailyPrice = 400.00m,
                        Status = PlaceStatus.Available,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = ownerUser.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Place
                    {
                        Name = "Conference Center B",
                        Location = "Business District, Cairo",
                        Capacity = 300,
                        Description = "Corporate environment with great connectivity and audio/visual setup.",
                        HourlyPrice = 40.00m,
                        DailyPrice = 300.00m,
                        Status = PlaceStatus.Available,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = ownerUser.Id,
                        CreatedAt = DateTime.UtcNow
                    }
                });
                await context.Set<Place>().AddRangeAsync(places);
                await context.SaveChangesAsync();
            }
            else
            {
                places = await context.Set<Place>().ToListAsync();
            }

            // 6. Seed Events (organized by Organizer, hosted at Place)
            var events = new List<Event>();
            if (!await context.Set<Event>().AnyAsync() && organizerUser != null && places.Any())
            {
                events.AddRange(new[]
                {
                    new Event
                    {
                        Title = "Tech Innovators Summit",
                        Description = "A summit for technology innovators to share ideas and connect.",
                        Category = "Technology",
                        TicketPrice = 150.00,
                        TotalTickets = 500,
                        RemainingTickets = 450,
                        StartDate = DateTime.UtcNow.AddDays(30),
                        EndDate = DateTime.UtcNow.AddDays(32),
                        PlaceId = places[0].Id,
                        Place = places[0].Name,
                        OrganizerId = organizerUser.Id,
                        Status = EventStatus.Published,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "Global Business Conference",
                        Description = "An international conference on modern business strategies.",
                        Category = "Business",
                        TicketPrice = 200.00,
                        TotalTickets = 300,
                        RemainingTickets = 150,
                        StartDate = DateTime.UtcNow.AddDays(45),
                        EndDate = DateTime.UtcNow.AddDays(47),
                        PlaceId = places[1].Id,
                        Place = places[1].Name,
                        OrganizerId = organizerUser.Id,
                        Status = EventStatus.Published,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "Fullstack .NET Session",
                        Description = "A great session with expert mentors covering .NET Core.",
                        Category = "Technology",
                        TicketPrice = 50.00,
                        TotalTickets = 100,
                        RemainingTickets = 100,
                        StartDate = DateTime.UtcNow.AddDays(15),
                        EndDate = DateTime.UtcNow.AddDays(15).AddHours(4),
                        PlaceId = places[0].Id,
                        Place = places[0].Name,
                        OrganizerId = organizerUser.Id,
                        Status = EventStatus.Published,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    }
                });
                await context.Set<Event>().AddRangeAsync(events);
                await context.SaveChangesAsync();
            }
            else
            {
                events = await context.Set<Event>().ToListAsync();
            }

            // 7. Seed Bookings (by Attendee for Event)
            if (!await context.Set<Booking>().AnyAsync() && attendeeUser2 != null && events.Any())
            {
                var bookings = new[]
                {
                    new Booking
                    {
                        AttendeeId = attendeeUser2.Id,
                        EventId = events[0].Id,
                        NumberOfTickets = 1,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow.AddDays(-5),
                        QRCode = "QR_1234567890",
                        CreatedAt = DateTime.UtcNow.AddDays(-5),
                        IsDeleted = false
                    },
                    new Booking
                    {
                        AttendeeId = attendeeUser2.Id,
                        EventId = events[1].Id,
                        NumberOfTickets = 2,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow.AddDays(-3),
                        QRCode = "QR_0987654321",
                        CreatedAt = DateTime.UtcNow.AddDays(-3),
                        IsDeleted = false
                    }
                };
                await context.Set<Booking>().AddRangeAsync(bookings);
                await context.SaveChangesAsync();
            }

            // 8. Seed PromoCodes (by Organizer for Event)
            if (!await context.Set<PromoCode>().AnyAsync() && organizerUser != null && events.Any())
            {
                var promoCodes = new[]
                {
                    new PromoCode
                    {
                        Code = "TECH10",
                        DiscountValue = 10.00m,
                        IsPercentage = true,
                        StartDate = DateTime.UtcNow,
                        ExpiryDate = DateTime.UtcNow.AddDays(30),
                        MaxUsageLimit = 100,
                        CurrentUsage = 5,
                        IsActive = true,
                        OrganizerId = organizerUser.Id,
                        EventId = events[0].Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new PromoCode
                    {
                        Code = "BIZ50",
                        DiscountValue = 50.00m,
                        IsPercentage = false,
                        StartDate = DateTime.UtcNow,
                        ExpiryDate = DateTime.UtcNow.AddDays(30),
                        MaxUsageLimit = 50,
                        CurrentUsage = 2,
                        IsActive = true,
                        OrganizerId = organizerUser.Id,
                        EventId = events[1].Id,
                        CreatedAt = DateTime.UtcNow
                    }
                };
                await context.Set<PromoCode>().AddRangeAsync(promoCodes);
                await context.SaveChangesAsync();
            }

            // 9. Seed Feedbacks
            if (!await context.Set<Feedback>().AnyAsync() && attendeeUser2 != null && events.Any() && places.Any() && organizerUser != null)
            {
                var feedbacks = new[]
                {
                    new Feedback
                    {
                        Rating = 5,
                        Comment = "Amazing tech conference! Well organized.",
                        AttendeeId = attendeeUser2.Id,
                        EventId = events[0].Id,
                        OrganizerId = organizerUser.Id,
                        PlaceId = places[0].Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Feedback
                    {
                        Rating = 4,
                        Comment = "Nice place and good service.",
                        AttendeeId = attendeeUser2.Id,
                        PlaceId = places[1].Id,
                        CreatedAt = DateTime.UtcNow
                    }
                };
                await context.Set<Feedback>().AddRangeAsync(feedbacks);
                await context.SaveChangesAsync();
            }
        }

        private static void ThrowIfFailed(IdentityResult result, string message)
        {
            if (result.Succeeded)
                return;

            var errors = string.Join(", ", result.Errors.Select(error => error.Description));
            throw new Exception($"{message}: {errors}");
        }
    }
}
