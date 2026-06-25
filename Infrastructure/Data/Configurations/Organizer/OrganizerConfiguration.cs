using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Domain.Entities.OrganizerEntities;

namespace Infrastructure.Data.Configurations
{
    public class OrganizerConfiguration : IEntityTypeConfiguration<Organizer>
    {
        public void Configure(EntityTypeBuilder<Organizer> builder)
        {
            builder.ToTable("Organizers");


            builder.Property(o => o.OrganizationName)
                .IsRequired()
                .HasMaxLength(50);

            var organizers = new List<Organizer>();
            for (int i = 1; i <= 25; i++)
            {
                organizers.Add(new Organizer
                {
                    Id = i,
                    OrganizationName = $"Organization {i}",
                    AverageRating = Math.Round(new Random().NextDouble() * 5, 2),
                    ReviewsCount = new Random().Next(0, 100)
                });
            }
        }
    }
}