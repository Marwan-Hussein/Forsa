using Domain.Entities.PlaceEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.ENUMs;

namespace Infrastructure.Data.Configurations
{
    public class PlaceConfiguration : IEntityTypeConfiguration<Place>
    {
        public void Configure(EntityTypeBuilder<Place> builder)
        {
            builder.ToTable("Places");

            builder.HasKey(p => p.Id);

            builder.HasOne(p => p.Owner)
                   .WithMany(o => o.Places)
                   .HasForeignKey(p => p.OwnerId)
                   .OnDelete(DeleteBehavior.NoAction);
            var places = new List<Place>();
            for (int i = 1; i <= 25; i++)
                places.Add(new Place
                {
                    Id = i,
                    Name = $"Place {i}",
                    Location = $"Location {i}",
                    Capacity = 100 + 10 * i,
                    Description = $"Description for Place {i}",
                    HourlyPrice = 10.0m + i,
                    DailyPrice = 100.0m + i,
                    Status = (PlaceStatus)(i % 6 + 1),
                    FacilityName = (FacilityName)(i % 4 + 1),
                    IsLocked = false,
                    OwnerId = (i % 5) + 1 // Assigning owners in a round-robin fashion
                });
                builder.HasData(
                    places
                );
        }
    }
}
