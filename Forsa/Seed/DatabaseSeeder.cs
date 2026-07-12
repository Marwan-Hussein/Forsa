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
                    new OrganizationType { Name = "Technology", Description = "Tech-focused organizations", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new OrganizationType { Name = "Business", Description = "Business and networking groups", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new OrganizationType { Name = "Education", Description = "Schools, universities, and training centers", IsActive = true, CreatedAt = DateTime.UtcNow }
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
                    new AttendeeInterest { InterestName = "Entrepreneurship", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Education", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "AI & Machine Learning", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Programming", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Marketing", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Finance", CreatedAt = DateTime.UtcNow },
                    new AttendeeInterest { InterestName = "Health", CreatedAt = DateTime.UtcNow }
                });
                await context.Set<AttendeeInterest>().AddRangeAsync(interests);
                await context.SaveChangesAsync();
            }
            else
            {
                interests = await context.Set<AttendeeInterest>().ToListAsync();
            }

            // 4. Seed Users
            // A. Seed Admin Users
            const string adminEmail = "admin@forsa.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
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
                var createResult = await userManager.CreateAsync(adminUser, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Admin user");
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }

            const string adminEmail2 = "marwan.hussein.450@gmail.com";
            var adminUser2 = await userManager.FindByEmailAsync(adminEmail2);
            if (adminUser2 == null)
            {
                var admin = new ApplicationUser
                {
                    FullName = "Admin",
                    UserName = adminEmail2,
                    NormalizedUserName = adminEmail2.ToUpperInvariant(),
                    Email = adminEmail2,
                    NormalizedEmail = adminEmail2.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01143777598",
                    Location = "Giza, Egypt",
                    BirthDate = new DateTime(2005, 9, 2),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                var createResult = await userManager.CreateAsync(admin, "Test@1234");
                ThrowIfFailed(createResult, "Failed to create Admin user");
                await userManager.AddToRoleAsync(admin, "Admin");
            }

            // B. Owner Users (to own the venues)
            var ownersToSeed = new[]
            {
                new { Email = "nagaty@forsa.com", Name = "Mohamed Abo elnaga", Phone = "01234567890", Location = "Cairo, Egypt" },
                new { Email = "bazaraa@forsa.com", Name = "Ayman Bazaraa", Phone = "01145678901", Location = "Giza, Egypt" }
            };
            var seededOwners = new List<Owner>();
            foreach (var ownerData in ownersToSeed)
            {
                var ownerUser = await userManager.FindByEmailAsync(ownerData.Email) as Owner;
                if (ownerUser == null)
                {
                    ownerUser = new Owner
                    {
                        FullName = ownerData.Name,
                        UserName = ownerData.Email,
                        NormalizedUserName = ownerData.Email.ToUpperInvariant(),
                        Email = ownerData.Email,
                        NormalizedEmail = ownerData.Email.ToUpperInvariant(),
                        EmailConfirmed = true,
                        PhoneNumber = ownerData.Phone,
                        Location = ownerData.Location,
                        BirthDate = new DateTime(1980, 1, 1),
                        ProfilePicture = string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        IsDeleted = false
                    };
                    var createResult = await userManager.CreateAsync(ownerUser, "Test@1234");
                    ThrowIfFailed(createResult, $"Failed to create Owner {ownerData.Name}");
                    await userManager.AddToRoleAsync(ownerUser, "Owner");
                }
                seededOwners.Add(ownerUser);
            }

            // C. Seed Organizers
            var organizersToSeed = new[]
            {
                new { Email = "iti@forsa.com", Name = "Information Technology Institute (ITI)", Phone = "01122334455", City = "Cairo, Egypt" },
                new { Email = "gdgcairo@forsa.com", Name = "Google Developer Groups Cairo", Phone = "01234567891", City = "Cairo, Egypt" },
                new { Email = "orange@forsa.com", Name = "Orange Digital Center", Phone = "01001122334", City = "Cairo, Egypt" },
                new { Email = "riseup@forsa.com", Name = "RiseUp", Phone = "01555667788", City = "Giza, Egypt" },
                new { Email = "bibalex@forsa.com", Name = "Bibliotheca Alexandrina", Phone = "01099887766", City = "Alexandria, Egypt" }
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
                        Location = orgData.City,
                        BirthDate = new DateTime(1995, 1, 1),
                        ProfilePicture = string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        IsDeleted = false,
                        OrganizationName = orgData.Name,
                        AverageRating = 4.8,
                        ReviewsCount = 5
                    };
                    var createResult = await userManager.CreateAsync(orgUser, "Test@1234");
                    ThrowIfFailed(createResult, $"Failed to create Organizer {orgData.Name}");
                    await userManager.AddToRoleAsync(orgUser, "Organizer");

                    // Link to Organization Type
                    var matchingType = orgTypes.FirstOrDefault(t => t.Name == "Technology") ?? orgTypes.FirstOrDefault();
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

            // D. Seed Attendees
            var attendeesToSeed = new[]
            {
                new { Email = "ahmed.ali@forsa.com", Name = "Ahmed Ali", Phone = "01045789123", City = "Cairo, Egypt" },
                new { Email = "mona.salah@forsa.com", Name = "Mona Salah", Phone = "01145678901", City = "Alexandria, Egypt" }
            };
            var seededAttendees = new List<Attendee>();
            foreach (var attData in attendeesToSeed)
            {
                var attUser = await userManager.FindByEmailAsync(attData.Email) as Attendee;
                if (attUser == null)
                {
                    attUser = new Attendee
                    {
                        FullName = attData.Name,
                        UserName = attData.Email,
                        NormalizedUserName = attData.Email.ToUpperInvariant(),
                        Email = attData.Email,
                        NormalizedEmail = attData.Email.ToUpperInvariant(),
                        EmailConfirmed = true,
                        PhoneNumber = attData.Phone,
                        Location = attData.City,
                        BirthDate = new DateTime(2000, 1, 1),
                        ProfilePicture = string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        IsDeleted = false,
                        LoyaltyPoint = 0
                    };
                    var createResult = await userManager.CreateAsync(attUser, "Test@1234");
                    ThrowIfFailed(createResult, $"Failed to create Attendee {attData.Name}");
                    await userManager.AddToRoleAsync(attUser, "Attendee");
                }
                seededAttendees.Add(attUser);
            }

            // 5. Seed Places (Venues)
            var places = new List<Place>();
            var owner = seededOwners.FirstOrDefault() ?? seededOwners.First();
            if (!await context.Set<Place>().AnyAsync())
            {
                places.AddRange(new[]
                {
                    new Place
                    {
                        Name = "Cairo International Convention Center",
                        Location = "Nasr City, Cairo, Egypt",
                        Capacity = 2000,
                        Description = "The Cairo International Convention Centre (CICC) is the only comprehensive congress center in Egypt.",
                        HourlyPrice = 500.00m,
                        DailyPrice = 4000.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = owner.Id,
                        Latitude = 30.0716m,
                        Longitude = 31.0182m,
                        GooglePlaceId = "ChIJk-tqO14fWBQRJ70FhT3f-vI",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Place
                    {
                        Name = "The Greek Campus",
                        Location = "28 Falaki St, Bab Al Louq, Cairo, Egypt",
                        Capacity = 800,
                        Description = "The Greek Campus is Cairo's first science and technology park, hosting startups, SMEs, and educational tech events.",
                        HourlyPrice = 120.00m,
                        DailyPrice = 900.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = owner.Id,
                        Latitude = 30.0441m,
                        Longitude = 31.2397m,
                        GooglePlaceId = "ChIJ6Yt3wW8fWBQR3uFq2q-F890",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Place
                    {
                        Name = "Smart Village",
                        Location = "KM 28 Cairo-Alexandria Desert Road, Giza, Egypt",
                        Capacity = 1200,
                        Description = "World-class business park conference facility in the heart of Egypt's tech district.",
                        HourlyPrice = 350.00m,
                        DailyPrice = 2500.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = owner.Id,
                        Latitude = 30.0784m,
                        Longitude = 31.0153m,
                        GooglePlaceId = "ChIJk-tqO14fWBQRJ70FhT3f-vI",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Place
                    {
                        Name = "Creativa Giza",
                        Location = "Cairo University St, Giza, Egypt",
                        Capacity = 250,
                        Description = "A creative hub supported by the Ministry of Communications and IT (MCIT) for learning and hacking.",
                        HourlyPrice = 40.00m,
                        DailyPrice = 300.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = owner.Id,
                        Latitude = 30.0263m,
                        Longitude = 31.2081m,
                        GooglePlaceId = "ChIJT_2fX3YfWBQRb_5W6p3h0i0",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Place
                    {
                        Name = "Bibliotheca Alexandrina Conference Center",
                        Location = "El Shatby, Alexandria, Egypt",
                        Capacity = 1500,
                        Description = "A state-of-the-art conference center located at the historic Bibliotheca Alexandrina in Alexandria.",
                        HourlyPrice = 450.00m,
                        DailyPrice = 3500.00m,
                        Status = PlaceStatus.Approved,
                        FacilityName = FacilityName.WiFi,
                        IsLocked = false,
                        OwnerId = owner.Id,
                        Latitude = 31.2089m,
                        Longitude = 29.9092m,
                        GooglePlaceId = "ChIJG4_V6Xy31RQRJ70FhT3f-vI",
                        CreatedAt = DateTime.UtcNow
                    }
                });
                await context.Set<Place>().AddRangeAsync(places);
                await context.SaveChangesAsync();

                // Add Weekly availability (default 9:00 AM – 9:00 PM)
                var availabilities = new List<PlaceAvailability>();
                foreach (var p in places)
                {
                    for (int i = 0; i < 7; i++)
                    {
                        availabilities.Add(new PlaceAvailability
                        {
                            PlaceId = p.Id,
                            Date = DateTime.UtcNow.Date.AddDays(i),
                            StartTime = TimeSpan.FromHours(9), // 9:00 AM
                            EndTime = TimeSpan.FromHours(21),   // 9:00 PM
                            Status = PlaceStatus.Approved,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                await context.Set<PlaceAvailability>().AddRangeAsync(availabilities);
                await context.SaveChangesAsync();
            }
            else
            {
                places = await context.Set<Place>().ToListAsync();
            }

            // 6. Seed Events
            var events = new List<Event>();
            if (!await context.Set<Event>().AnyAsync() && seededOrganizers.Any() && places.Any())
            {
                var itiOrg = seededOrganizers.FirstOrDefault(o => o.Email == "iti@forsa.com") ?? seededOrganizers.First();
                var gdgOrg = seededOrganizers.FirstOrDefault(o => o.Email == "gdgcairo@forsa.com") ?? seededOrganizers.First();
                var orangeOrg = seededOrganizers.FirstOrDefault(o => o.Email == "orange@forsa.com") ?? seededOrganizers.First();
                var riseupOrg = seededOrganizers.FirstOrDefault(o => o.Email == "riseup@forsa.com") ?? seededOrganizers.First();
                var alexOrg = seededOrganizers.FirstOrDefault(o => o.Email == "bibalex@forsa.com") ?? seededOrganizers.First();

                events.AddRange(new[]
                {
                    new Event
                    {
                        Title = "AI Summit Egypt",
                        Description = "The premier AI gathering in Cairo, bringing together researchers, developers, and industry experts.",
                        Category = "AI & Machine Learning",
                        TicketPrice = 200.00,
                        TotalTickets = 500,
                        RemainingTickets = 500,
                        StartDate = DateTime.UtcNow.AddDays(10),
                        EndDate = DateTime.UtcNow.AddDays(10).AddHours(8),
                        PlaceId = places[0].Id,
                        OrganizerId = gdgOrg.Id,
                        Status = EventStatus.Draft,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "Startup Pitch Night",
                        Description = "A night where Egyptian startups pitch their ideas to prominent venture capitalists and angel investors.",
                        Category = "Entrepreneurship",
                        TicketPrice = 100.00,
                        TotalTickets = 300,
                        RemainingTickets = 300,
                        StartDate = DateTime.UtcNow.AddDays(15),
                        EndDate = DateTime.UtcNow.AddDays(15).AddHours(4),
                        PlaceId = places[1].Id,
                        OrganizerId = riseupOrg.Id,
                        Status = EventStatus.Pending,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "Career Fair Cairo",
                        Description = "Connect face-to-face with top tech employers and companies in Egypt.",
                        Category = "Business",
                        TicketPrice = 0.00,
                        TotalTickets = 1000,
                        RemainingTickets = 1000,
                        StartDate = DateTime.UtcNow.AddDays(20),
                        EndDate = DateTime.UtcNow.AddDays(20).AddHours(9),
                        PlaceId = places[2].Id,
                        OrganizerId = orangeOrg.Id,
                        Status = EventStatus.Approved,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "Digital Marketing Workshop",
                        Description = "Master the latest tools and strategies in digital marketing, SEO, and paid advertising.",
                        Category = "Marketing",
                        TicketPrice = 100.00,
                        TotalTickets = 150,
                        RemainingTickets = 148, // 2 tickets booked
                        StartDate = DateTime.UtcNow.AddDays(25),
                        EndDate = DateTime.UtcNow.AddDays(25).AddHours(6),
                        PlaceId = places[3].Id,
                        OrganizerId = alexOrg.Id,
                        Status = EventStatus.Published,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Event
                    {
                        Title = "Blood Donation Campaign",
                        Description = "A public service campaign organized to help supply local blood banks in Alexandria.",
                        Category = "Health",
                        TicketPrice = 0.00,
                        TotalTickets = 500,
                        RemainingTickets = 497, // 3 tickets booked
                        StartDate = DateTime.UtcNow.AddDays(30),
                        EndDate = DateTime.UtcNow.AddDays(30).AddHours(8),
                        PlaceId = places[4].Id,
                        OrganizerId = itiOrg.Id,
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

            // 7. Seed Bookings (Tickets)
            if (!await context.Set<Booking>().AnyAsync() && seededAttendees.Any() && events.Any(e => e.Status == EventStatus.Published))
            {
                var publishedEvents = events.Where(e => e.Status == EventStatus.Published).ToList();
                var bookings = new List<Booking>();

                if (publishedEvents.Count >= 2)
                {
                    var att1 = seededAttendees[0];
                    var att2 = seededAttendees[1];

                    // Booking 1: Regular
                    bookings.Add(new Booking
                    {
                        AttendeeId = att1.Id,
                        EventId = publishedEvents[0].Id,
                        NumberOfTickets = 1,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow,
                        QRCode = "QR_EGY_001",
                        CreatedAt = DateTime.UtcNow
                    });

                    // Booking 2: Student
                    bookings.Add(new Booking
                    {
                        AttendeeId = att2.Id,
                        EventId = publishedEvents[0].Id,
                        NumberOfTickets = 1,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow,
                        QRCode = "QR_EGY_002",
                        CreatedAt = DateTime.UtcNow
                    });

                    // Booking 3: VIP
                    bookings.Add(new Booking
                    {
                        AttendeeId = att1.Id,
                        EventId = publishedEvents[1].Id,
                        NumberOfTickets = 1,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow,
                        QRCode = "QR_EGY_003",
                        CreatedAt = DateTime.UtcNow
                    });

                    // Booking 4: Free
                    bookings.Add(new Booking
                    {
                        AttendeeId = att2.Id,
                        EventId = publishedEvents[1].Id,
                        NumberOfTickets = 2,
                        Status = BookingStatus.Confirmed,
                        BookingDate = DateTime.UtcNow,
                        QRCode = "QR_EGY_004",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await context.Set<Booking>().AddRangeAsync(bookings);
                await context.SaveChangesAsync();
            }

            // 8. Seed Feedbacks (Reviews)
            if (!await context.Set<Feedback>().AnyAsync() && seededAttendees.Any() && events.Any() && places.Any())
            {
                var feedOrganizer = seededOrganizers.First();
                await context.Set<Feedback>().AddRangeAsync(new[]
                {
                    new Feedback { Rating = 5, Comment = "Brilliant summit! Cairo needed something this well organized.", AttendeeId = seededAttendees[0].Id, EventId = events[0].Id, PlaceId = places[0].Id, OrganizerId = feedOrganizer.Id, CreatedAt = DateTime.UtcNow },
                    new Feedback { Rating = 4, Comment = "Very nice and spacious venue, perfect for tech summits.", AttendeeId = seededAttendees[1].Id, EventId = events[1].Id, PlaceId = places[1].Id, OrganizerId = feedOrganizer.Id, CreatedAt = DateTime.UtcNow },
                    new Feedback { Rating = 5, Comment = "Extremely beneficial talks and outstanding startup ideas.", AttendeeId = seededAttendees[0].Id, EventId = events[2].Id, PlaceId = places[2].Id, OrganizerId = feedOrganizer.Id, CreatedAt = DateTime.UtcNow },
                    new Feedback { Rating = 4, Comment = "The Greek Campus continues to be the best hub for young startups.", AttendeeId = seededAttendees[1].Id, PlaceId = places[1].Id, CreatedAt = DateTime.UtcNow },
                    new Feedback { Rating = 5, Comment = "Wonderful organization and highly cooperative organizers.", AttendeeId = seededAttendees[0].Id, PlaceId = places[0].Id, CreatedAt = DateTime.UtcNow }
                });
                await context.SaveChangesAsync();
            }

            // 9. Seed Notifications
            if (!await context.Set<Notification>().AnyAsync() && adminUser != null)
            {
                await context.Set<Notification>().AddRangeAsync(new[]
                {
                    new Notification { Message = "Your event 'AI Summit Egypt' has been approved successfully! 🎉", Type = NotificationType.GeneralAlert, SentVia = DeliveryMethod.Email, Status = NotificationStatus.Sent, UserId = adminUser.Id, CreatedAt = DateTime.UtcNow },
                    new Notification { Message = "Venue request for 'Smart Village' was rejected. Please select another date.", Type = NotificationType.GeneralAlert, SentVia = DeliveryMethod.Email, Status = NotificationStatus.Sent, UserId = adminUser.Id, CreatedAt = DateTime.UtcNow },
                    new Notification { Message = "Venue booking for 'The Greek Campus' has been approved by the owner! 🥳", Type = NotificationType.GeneralAlert, SentVia = DeliveryMethod.Email, Status = NotificationStatus.Sent, UserId = adminUser.Id, CreatedAt = DateTime.UtcNow },
                    new Notification { Message = "You have successfully purchased 1 VIP Ticket for 'AI Summit Egypt'.", Type = NotificationType.GeneralAlert, SentVia = DeliveryMethod.Email, Status = NotificationStatus.Sent, UserId = adminUser.Id, CreatedAt = DateTime.UtcNow },
                    new Notification { Message = "Reminder: 'Career Fair Cairo' starts tomorrow at 9:00 AM.", Type = NotificationType.GeneralAlert, SentVia = DeliveryMethod.Email, Status = NotificationStatus.Sent, UserId = adminUser.Id, CreatedAt = DateTime.UtcNow }
                });
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

        private static async Task EnsurePlaceColumnsAsync(ForsaDbContext context)
        {
            var sql = @"
IF COL_LENGTH(N'Places', N'Latitude') IS NULL
    ALTER TABLE [Places] ADD [Latitude] decimal(18,15) NULL;
IF COL_LENGTH(N'Places', N'Longitude') IS NULL
    ALTER TABLE [Places] ADD [Longitude] decimal(18,15) NULL;
IF COL_LENGTH(N'Places', N'GooglePlaceId') IS NULL
    ALTER TABLE [Places] ADD [GooglePlaceId] nvarchar(400) NULL;
";
            await context.Database.ExecuteSqlRawAsync(sql);
        }
    }
}
