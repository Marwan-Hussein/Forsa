using Domain.Entities.PlaceEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.ENUMs;

namespace Infrastructure.Data.Configurations
{
    public class PlaceAvailabilityConfiguration : IEntityTypeConfiguration<PlaceAvailability>
    {
        public void Configure(EntityTypeBuilder<PlaceAvailability> builder)
        {
            builder.ToTable("PlaceAvailabilities");

            builder.HasKey(pa => pa.Id);

            builder.HasOne(pa => pa.Place)
                   .WithMany(p => p.PlaceAvailabilities)
                   .HasForeignKey(pa => pa.PlaceId)
                   .OnDelete(DeleteBehavior.Cascade);
            var placeAvailabilities = new List<PlaceAvailability>();
            for(int i = 1; i < 10; i++)
                placeAvailabilities.Add(new PlaceAvailability
                {
                    Id = i,
                    Date = DateTime.Now.AddDays(i),
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    Status = (PlaceStatus)(i % 6 + 1),
                    PlaceId = i
                });
            builder.HasData(placeAvailabilities);
        }
    }
}
