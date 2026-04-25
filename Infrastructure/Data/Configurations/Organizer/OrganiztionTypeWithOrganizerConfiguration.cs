using Domain.Entities.OrganizerEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class OrganiztionTypeWithOrganizerConfiguration : IEntityTypeConfiguration<OrganiztionTypeWithOrganizer>
    {
        public void Configure(EntityTypeBuilder<OrganiztionTypeWithOrganizer> builder)
        {
            builder.ToTable("OrganiztionTypeWithOrganizer");

            builder.HasKey(o => o.Id);

            builder.HasOne(o => o.Organizer)
                   .WithMany(o => o.OrganiztionTypeWithOrganizers)
                   .HasForeignKey(o => o.OrganizerId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(o => o.OrganizationType)
                   .WithMany(o => o.OrganiztionTypeWithOrganizers)
                   .HasForeignKey(o => o.OrganizationTypeId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
