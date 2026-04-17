using Domain.Entities.PlaceEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class PlaceMediaConfiguration : IEntityTypeConfiguration<PlaceMedia>
    {
        public void Configure(EntityTypeBuilder<PlaceMedia> builder)
        {
            builder.ToTable("PlaceMedias");

            builder.HasKey(pm => pm.Id);

            builder.HasOne(pm => pm.Place)
                   .WithMany(p => p.PlaceMedias)
                   .HasForeignKey(pm => pm.PlaceId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
