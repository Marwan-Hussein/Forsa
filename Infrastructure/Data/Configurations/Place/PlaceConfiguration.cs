using Domain.Entities.PlaceEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

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

            builder.Property(p => p.Latitude)
                   .HasColumnType("decimal(18, 15)")
                   .IsRequired(false);

            builder.Property(p => p.Longitude)
                   .HasColumnType("decimal(18, 15)")
                   .IsRequired(false);

            builder.Property(p => p.GooglePlaceId)
                   .HasMaxLength(400)
                   .IsRequired(false);
        }
    }
}
