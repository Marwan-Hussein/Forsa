using Domain.Entities.AttendeeEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AttendeeInterestConfiguration : IEntityTypeConfiguration<AttendeeInterest>
    {
        public void Configure(EntityTypeBuilder<AttendeeInterest> builder)
        {
            builder.ToTable("AttendeeInterests");
            builder.HasKey(ai => ai.Id);

            builder.HasMany(ai => ai.AttendeeInterestes)
                   .WithOne(aii => aii.AttendeeInterest)
                   .HasForeignKey(aii => aii.AttendeeInterestId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasData(
                new AttendeeInterest
                {
                    Id = 1,
                    InterestName = "Technology",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                },
                new AttendeeInterest
                {
                    Id = 2,
                    InterestName = "Business",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                },
                new AttendeeInterest
                {
                    Id = 3,
                    InterestName = "Education",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                },
                new AttendeeInterest
                {
                    Id = 4,
                    InterestName = "Sports",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                },
                new AttendeeInterest
                {
                    Id = 5,
                    InterestName = "Music",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                },
                new AttendeeInterest
                {
                    Id = 6,
                    InterestName = "Art",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                },
                new AttendeeInterest
                {
                    Id = 7,
                    InterestName = "Health",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                },
                new AttendeeInterest
                {
                    Id = 8,
                    InterestName = "Travel",
                    CreatedAt = new DateTime(2026, 1, 1),
                    IsDeleted = false
                });
        }
    }
}
