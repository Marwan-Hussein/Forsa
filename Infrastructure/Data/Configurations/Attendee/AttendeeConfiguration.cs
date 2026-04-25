using Domain.Entities;
using Domain.Entities.AttendeeEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Infrastructure.Data.Configurations
{
    public class AttendeeConfiguration : IEntityTypeConfiguration<Attendee>
    {
        public void Configure(EntityTypeBuilder<Attendee> builder)
        {
            builder.ToTable("Attendees");
            builder.HasOne(a => a.WishList)
              .WithOne(w => w.Attendee)
              .HasForeignKey<WishListItem>(w => w.AttendeeId)
              .OnDelete(DeleteBehavior.NoAction);
            builder.HasMany(a => a.AttendeeInterestesWithAttendee)
                   .WithOne(ai => ai.Attendee)
                   .HasForeignKey(ai => ai.AttendeeId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasData(
                new Attendee
                {
                    Id = 2, // Assuming standard ID sequence for User seeding
                    UserName = "testattendee",
                    Email = "attendee@forsa.com",
                    NormalizedEmail = "ATTENDEE@FORSA.COM",
                    EmailConfirmed = true,
                    FullName = "Test Attendee",
                    Location = "Dummy Location",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false,
                    LoyaltyPoint = 0
                }
            );
        }
    }
}
