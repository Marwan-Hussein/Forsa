using Domain.Entities.PlaceEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

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
        }
    }
}
