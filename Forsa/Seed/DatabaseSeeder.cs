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
            //await context.Database.MigrateAsync();

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

            // 3. Seed Users
            // A. Seed Admin
            const string adminEmail = "admin@forsa.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                var admin = new ApplicationUser
                {
                    FullName = "System Admin",
                    UserName = adminEmail,
                    NormalizedUserName = adminEmail.ToUpperInvariant(),
                    Email = adminEmail,
                    NormalizedEmail = adminEmail.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01000000000",
                    Location = "Cairo, Egypt",
                    BirthDate = new DateTime(1985, 1, 1),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(admin, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Admin user");
                await userManager.AddToRoleAsync(admin, "Admin");
            }

            // B. Seed Organizers
            var organizersToSeed = new[]
            {
                new { Email = "iti@forsa.com", Name = "Information Technology Institute (ITI)", OrgName = "Information Technology Institute (ITI)", TypeName = "Education", Phone = "01122334455" },
                new { Email = "alx@forsa.com", Name = "ALX Egypt", OrgName = "ALX Egypt", TypeName = "Education", Phone = "01234567890" },
                new { Email = "riseup@forsa.com", Name = "RiseUp", OrgName = "RiseUp", TypeName = "Business", Phone = "01001122334" },
                new { Email = "wuzzuf@forsa.com", Name = "WUZZUF", OrgName = "WUZZUF", TypeName = "Business", Phone = "01555667788" },
                new { Email = "techne@forsa.com", Name = "Techne Summit", OrgName = "Techne Summit", TypeName = "Tech", Phone = "01099887766" }
            };

            var seededOrganizers = new List<Organizer>();
            foreach (var orgData in organizersToSeed)
            {
                var orgUser = await userManager.FindByEmailAsync(orgData.Email) as Organizer;
                if (orgUser == null)
                {
                    orgUser = new Organizer
                    {
                        FullName = orgData.Name,
                        UserName = orgData.Email,
                        NormalizedUserName = orgData.Email.ToUpperInvariant(),
                        Email = orgData.Email,
                        NormalizedEmail = orgData.Email.ToUpperInvariant(),
                        EmailConfirmed = true,
                        PhoneNumber = orgData.Phone,
                        Location = "Egypt",
                        BirthDate = new DateTime(1995, 1, 1),
                        ProfilePicture = string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        IsDeleted = false,
                        OrganizationName = orgData.OrgName,
                        AverageRating = 4.9,
                        ReviewsCount = 12
                    };
                    var createResult = await userManager.CreateAsync(orgUser, "Test@1234");
                    ThrowIfFailed(createResult, $"Failed to create Organizer {orgData.Name}");
                    await userManager.AddToRoleAsync(orgUser, "Organizer");

                    // Link to Organization Type
                    var matchingType = orgTypes.FirstOrDefault(t => t.Name == orgData.TypeName) ?? orgTypes.FirstOrDefault();
                    if (matchingType != null)
                    {
                        await context.Set<OrganiztionTypeWithOrganizer>().AddAsync(new OrganiztionTypeWithOrganizer
                        {
                            OrganizerId = orgUser.Id,
                            OrganizationTypeId = matchingType.Id
                        });
                        await context.SaveChangesAsync();
                    }
                }
                seededOrganizers.Add(orgUser);
            }

            var organizerUser = seededOrganizers.FirstOrDefault(o => o.Email == "iti@forsa.com") ?? seededOrganizers.First();

            // C. Seed Attendee
            const string attendeeEmail1 = "omier.ahmed@forsa.com";
            var attendeeUser1 = await userManager.FindByEmailAsync(attendeeEmail1);
            if (attendeeUser1 == null)
            {
                var attendee = new Attendee
                {
                    FullName = "Omier Ahmed",
                    UserName = attendeeEmail1,
                    NormalizedUserName = attendeeEmail1.ToUpperInvariant(),
                    Email = attendeeEmail1,
                    NormalizedEmail = attendeeEmail1.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01045789123",
                    Location = "Alexandria, Egypt",
                    BirthDate = new DateTime(2005, 10, 20),
                    ProfilePicture = "/uploads/profiles/18/22ce6200-e91d-4c4b-b2d9-86e66fb6cd8b.jpeg",
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    LoyaltyPoint = 0
                };
                var createResult = await userManager.CreateAsync(attendee, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Attendee 1 user");
                await userManager.AddToRoleAsync(attendee, "Attendee");
            }

            const string attendeeEmail2 = "adel.hefny@forsa.com";
            var attendeeUser2 = await userManager.FindByEmailAsync(attendeeEmail2);
            if (attendeeUser2 == null)
            {
                var attendee = new Attendee
                {
                    FullName = "Adel Hefny",
                    UserName = attendeeEmail2,
                    NormalizedUserName = attendeeEmail2.ToUpperInvariant(),
                    Email = attendeeEmail2,
                    NormalizedEmail = attendeeEmail2.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01145678901",
                    Location = "Asuit, Egypt",
                    BirthDate = new DateTime(2006, 2, 14),
                    ProfilePicture = "/uploads/profiles/18/22ce6200-e91d-4c4b-b2d9-86e66fb6cd8b.jpeg",
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    LoyaltyPoint = 0
                };
                var createResult = await userManager.CreateAsync(attendee, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Attendee 2 user");
                await userManager.AddToRoleAsync(attendee, "Attendee");
                attendeeUser2 = attendee;
            }

            //// D. Seed Owner
            const string ownerEmail1 = "Nagaty@forsa.com";
            var ownerUser1 = await userManager.FindByEmailAsync(ownerEmail1) as Owner;
            if (ownerUser1 == null)
            {
                var owner = new Owner
                {
                    FullName = "Mohamed Abo elnaga",
                    UserName = ownerEmail1,
                    NormalizedUserName = ownerEmail1.ToUpperInvariant(),
                    Email = ownerEmail1,
                    NormalizedEmail = ownerEmail1.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01234567890",
                    Location = "Giza, Egypt",
                    BirthDate = new DateTime(1973, 11, 30),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(owner, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Owner user");
                await userManager.AddToRoleAsync(owner, "Owner");
                ownerUser1 = owner;
            }

            const string ownerEmail2 = "Ayman.Bazaraa@forsa.com";
            var ownerUser2 = await userManager.FindByEmailAsync(ownerEmail2) as Owner;
            if (ownerUser2 == null)
            {
                var owner = new Owner
                {
                    FullName = "Ayman Bazaraa",
                    UserName = ownerEmail2,
                    NormalizedUserName = ownerEmail2.ToUpperInvariant(),
                    Email = ownerEmail2,
                    NormalizedEmail = ownerEmail2.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01145678901",
                    Location = "Giza, Egypt",
                    BirthDate = new DateTime(1980, 11, 30),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(owner, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Owner user");
                await userManager.AddToRoleAsync(owner, "Owner");
                ownerUser2 = owner;
            }

            const string ownerEmail3 = "Ali.Shaheen@forsa.com";
            var ownerUser3 = await userManager.FindByEmailAsync(ownerEmail3) as Owner;
            if (ownerUser3 == null)
            {
                var owner = new Owner
                {
                    FullName = "Ali Shaheen",
                    UserName = ownerEmail3,
                    NormalizedUserName = ownerEmail3.ToUpperInvariant(),
                    Email = ownerEmail3,
                    NormalizedEmail = ownerEmail3.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01145678902",
                    Location = "Aswan, Egypt",
                    BirthDate = new DateTime(1973, 11, 30),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(owner, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Owner user");
                await userManager.AddToRoleAsync(owner, "Owner");
                ownerUser1 = owner;
            }

            const string ownerEmail4 = "Saweras@forsa.com";
            var ownerUser4 = await userManager.FindByEmailAsync(ownerEmail4) as Owner;
            if (ownerUser4 == null)
            {
                var owner = new Owner
                {
                    FullName = "Nageeb Saweras",
                    UserName = ownerEmail4,
                    NormalizedUserName = ownerEmail4.ToUpperInvariant(),
                    Email = ownerEmail4,
                    NormalizedEmail = ownerEmail4.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01222222222",
                    Location = "Giza, Egypt",
                    BirthDate = new DateTime(1960, 11, 30),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(owner, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Owner user");
                await userManager.AddToRoleAsync(owner, "Owner");
                ownerUser1 = owner;
            }

            const string ownerEmail5 = "Hossam.Hassan@forsa.com";
            var ownerUser5 = await userManager.FindByEmailAsync(ownerEmail5) as Owner;
            if (ownerUser5 == null)
            {
                var owner = new Owner
                {
                    FullName = "Hossam Hassan",
                    UserName = ownerEmail5,
                    NormalizedUserName = ownerEmail5.ToUpperInvariant(),
                    Email = ownerEmail5,
                    NormalizedEmail = ownerEmail5.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01555999999",
                    Location = "Damitee, Egypt",
                    BirthDate = new DateTime(1958, 11, 30),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(owner, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Owner user");
                await userManager.AddToRoleAsync(owner, "Owner");
                ownerUser1 = owner;
            }

        // 4. Seed Places (owned by Owner)
        var places = new List<Place>();
            if (!await context.Set<Place>().AnyAsync() && ownerUser1 != null)
            {
                places.AddRange(new[]
                {
                    new Place
                    {
            Name = "The Greek Campus",
                        Location = "28 Falaki St, Bab Al Louq, Cairo",
                        Capacity = 800,
                        Description = "The Greek Campus is Cairo's first science and technology park, hosting startups, SMEs, and educational tech events.",
                        HourlyPrice = 120.00m,
                        DailyPrice = 900.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = ownerUser1.Id,
                        Latitude = 30.0441m,
                        Longitude = 31.2397m,
                        GooglePlaceId = "ChIJ6Yt3wW8fWBQR3uFq2q-F890",
                        CreatedAt = DateTime.UtcNow
        },
                    new Place
                    {
            Name = "AUC Tahrir Square - Ewart Hall",
                        Location = "Tahrir Square, Downtown Cairo",
                        Capacity = 1000,
                        Description = "Ewart Memorial Hall is a historic, premium hall at the American University in Cairo (AUC), downtown.",
                        HourlyPrice = 250.00m,
                        DailyPrice = 2000.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = ownerUser1.Id,
                        Latitude = 30.0428m,
                        Longitude = 31.2403m,
                        GooglePlaceId = "ChIJN-SjRmsfWBQRgE_X20xH4M4",
                        CreatedAt = DateTime.UtcNow
        },
                    new Place
                    {
            Name = "CREATIVA Innovation Hub Giza",
                        Location = "Giza Governorate, close to Cairo University",
                        Capacity = 250,
                        Description = "A creative hub supported by the Ministry of Communications and IT (MCIT) for learning and hacking.",
                        HourlyPrice = 40.00m,
                        DailyPrice = 300.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = ownerUser1.Id,
                        Latitude = 30.0263m,
                        Longitude = 31.2081m,
                        GooglePlaceId = "ChIJT_2fX3YfWBQRb_5W6p3h0i0",
                        CreatedAt = DateTime.UtcNow
        },
                    new Place
                    {
            Name = "Smart Village Conference Center",
                        Location = "KM 28 Cairo-Alexandria Desert Road, Giza",
                        Capacity = 1200,
                        Description = "World-class business park conference facility in the heart of Egypt's tech district.",
                        HourlyPrice = 350.00m,
                        DailyPrice = 2500.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = ownerUser1.Id,
                        Latitude = 30.0716m,
                        Longitude = 31.0182m,
                        GooglePlaceId = "ChIJk-tqO14fWBQRJ70FhT3f-vI",
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

            // Seed PlaceMedias
            if (!await context.Set<PlaceMedia>().AnyAsync() && places.Any())
            {
                var placeMedias = new List<PlaceMedia>();

                // Greek Campus (Place 1)
                placeMedias.AddRange(new[]
                {
                    new PlaceMedia { PlaceId = places[0].Id, MediaURL = "/uploads/places/1/3c5dfd05-3614-4ca3-8917-44e2bf61a011.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[0].Id, MediaURL = "/uploads/places/1/78cf142f-cf44-4aef-8d00-ce2af0037fb0.jfif", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[0].Id, MediaURL = "/uploads/places/1/93ddf056-5ceb-4759-b410-e1f8c4d7ab0e.jfif", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[0].Id, MediaURL = "/uploads/places/1/b9d301c8-962c-45ca-a183-3328cdafc5c4.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[0].Id, MediaURL = "/uploads/places/1/d289b316-61c1-49bc-8d2b-5c4abeac761b.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                });

                // AUC (Place 2)
                placeMedias.AddRange(new[]
                {
                    new PlaceMedia { PlaceId = places[1].Id, MediaURL = "/uploads/places/2/32c395e8-371d-4544-8346-0b432215a391.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[1].Id, MediaURL = "/uploads/places/2/3da4f6e3-120c-4a42-88d9-1b5e68935fae.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[1].Id, MediaURL = "/uploads/places/2/59765e5a-4574-4ac8-ae7e-ed8c0eb760ec.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[1].Id, MediaURL = "/uploads/places/2/8a127b63-0fb1-46e6-9a32-1f91e8162eaa.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[1].Id, MediaURL = "/uploads/places/2/eaa85226-ad65-4f2a-81e1-eb21d9f344a7.jfif", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                });

                // CREATIVA (Place 3)
                placeMedias.AddRange(new[]
                {
                    new PlaceMedia { PlaceId = places[2].Id, MediaURL = "/uploads/places/3/2a6ef81c-17b5-44c5-9329-f1ea81933132.jfif", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[2].Id, MediaURL = "/uploads/places/3/2ca9ffb7-68c2-46e8-bb89-ef1d87b4c508.jfif", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[2].Id, MediaURL = "/uploads/places/3/caf284f7-5c3e-4ebe-ba1b-6f0a6c7a80c8.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                    new PlaceMedia { PlaceId = places[2].Id, MediaURL = "/uploads/places/3/efc10705-1784-4f3a-bd0f-c0db3077e41f.jpg", MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow },
                });

                await context.Set<PlaceMedia>().AddRangeAsync(placeMedias);
                await context.SaveChangesAsync();
            }

//6.Seed Events(organized by Organizer, hosted at Place)
            var events = new List<Event>();
if (!await context.Set<Event>().AnyAsync() && seededOrganizers.Any() && places.Any())
{
    var itiOrg = seededOrganizers.FirstOrDefault(o => o.Email == "iti@forsa.com") ?? seededOrganizers.First();
    var alxOrg = seededOrganizers.FirstOrDefault(o => o.Email == "alx@forsa.com") ?? seededOrganizers.First();
    var wuzzufOrg = seededOrganizers.FirstOrDefault(o => o.Email == "wuzzuf@forsa.com") ?? seededOrganizers.First();
    var techneOrg = seededOrganizers.FirstOrDefault(o => o.Email == "techne@forsa.com") ?? seededOrganizers.First();

    var greekCampus = places.FirstOrDefault(p => p.Name.Contains("Greek")) ?? places[0];
    var aucTahrir = places.FirstOrDefault(p => p.Name.Contains("AUC")) ?? places[0];
    var creativa = places.FirstOrDefault(p => p.Name.Contains("CREATIVA")) ?? places[0];
    var smartVillage = places.FirstOrDefault(p => p.Name.Contains("Smart")) ?? places[0];

    events.AddRange(new[]
    {
                    new Event
                    {
                        Title = "Techshift Summit Cairo 2026",
                        Description = "The largest summit for tech careers and digital shift in Cairo. Meet industry leaders, discover tech trends, and find job opportunities.",
                        Category = "Technology",
                        TicketPrice = 250.00,
                        TotalTickets = 800,
                        RemainingTickets = 750,
                        StartDate = DateTime.UtcNow.AddDays(15),
                        EndDate = DateTime.UtcNow.AddDays(15).AddHours(8),
                        PlaceId = greekCampus.Id,
                        Place = greekCampus,
                        OrganizerId = techneOrg.Id,
                        Status = EventStatus.Published,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "Wuzzuf Annual Tech Career Fair 2026",
                        Description = "Egypt's number one tech employment event. Connect face-to-face with top employers, attend tech talks, and take your career to the next level.",
                        Category = "Business",
                        TicketPrice = 0.00,
                        TotalTickets = 1000,
                        RemainingTickets = 850,
                        StartDate = DateTime.UtcNow.AddDays(30),
                        EndDate = DateTime.UtcNow.AddDays(30).AddHours(9),
                        PlaceId = aucTahrir.Id,
                        Place = aucTahrir,
                        OrganizerId = wuzzufOrg.Id,
                        Status = EventStatus.Published,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "ITI AI & Web Development Hackathon",
                        Description = "A 48-hour challenge organized by the Information Technology Institute to build next-generation web applications powered by generative AI.",
                        Category = "Education",
                        TicketPrice = 50.00,
                        TotalTickets = 200,
                        RemainingTickets = 190,
                        StartDate = DateTime.UtcNow.AddDays(10),
                        EndDate = DateTime.UtcNow.AddDays(12),
                        PlaceId = creativa.Id,
                        Place = creativa,
                        OrganizerId = itiOrg.Id,
                        Status = EventStatus.Published,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "ALX Software Engineering Graduation & Pitch Day",
                        Description = "Celebrate the graduation of ALX software engineering cohort. Watch them pitch innovative projects to venture capitalists and recruiters.",
                        Category = "Technology",
                        TicketPrice = 100.00,
                        TotalTickets = 500,
                        RemainingTickets = 500,
                        StartDate = DateTime.UtcNow.AddDays(45),
                        EndDate = DateTime.UtcNow.AddDays(45).AddHours(6),
                        PlaceId = smartVillage.Id,
                        Place = smartVillage,
                        OrganizerId = alxOrg.Id,
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

            // Seed EventMedias
            if (!await context.Set<EventMedia>().AnyAsync() && events.Any())
            {
                var eventMedias = new List<EventMedia>();

                // Event 1: Techshift Summit Cairo 2026
                eventMedias.Add(new EventMedia
                {
                    EventId = events[0].Id,
                    MediaUrl = "/uploads/events/1/e94cdcef-93a3-4908-8046-48997a0c53f6.jfif",
                    MediaType = "Image",
                    CreatedAt = DateTime.UtcNow
                });

                // Event 2: Wuzzuf Annual Tech Career Fair 2026
                eventMedias.Add(new EventMedia
                {
                    EventId = events[1].Id,
                    MediaUrl = "/uploads/events/2/4f995008-bcaf-4365-a048-b102ac2f11ee.jpg",
                    MediaType = "Image",
                    CreatedAt = DateTime.UtcNow
                });

                // Event 3: ITI AI & Web Development Hackathon
                eventMedias.Add(new EventMedia
                {
                    EventId = events[2].Id,
                    MediaUrl = "/uploads/events/3/7285a4f2-5a69-41ed-b533-464a4734a558.png",
                    MediaType = "Image",
                    CreatedAt = DateTime.UtcNow
                });

                // Event 4: ALX Software Engineering Graduation & Pitch Day
                eventMedias.Add(new EventMedia
                {
                    EventId = events[3].Id,
                    MediaUrl = "/uploads/events/4/dd6298c2-d488-44b0-a8c0-7edb7d6e3e80.png",
                    MediaType = "Image",
                    CreatedAt = DateTime.UtcNow
                });

                await context.Set<EventMedia>().AddRangeAsync(eventMedias);
                await context.SaveChangesAsync();
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
