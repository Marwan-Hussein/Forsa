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
        }
    }
}