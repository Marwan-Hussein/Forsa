using Domain.Entities.PlaceEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.ENUMs;
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

            var placeMedias = new List<PlaceMedia>();
            for(int i=1; i <= 25; i++)
                placeMedias.Add(new PlaceMedia
                {
                    Id = i,
                    PlaceId = i%10 +1,
                    MediaType = (MediaType)(i % 2 + 1),
                    MediaURL = $"https://forsa.com/mediaURLs/{i}.jpg",
                });
            builder.HasData(placeMedias);
        }
    }
}
