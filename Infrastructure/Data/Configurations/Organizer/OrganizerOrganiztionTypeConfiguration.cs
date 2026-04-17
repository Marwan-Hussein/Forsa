using Domain.Entities.OrganizerEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class OrganizerOrganiztionTypeConfiguration : IEntityTypeConfiguration<OrganizerOrganiztionType>
    {
        public void Configure(EntityTypeBuilder<OrganizerOrganiztionType> builder)
        {
            builder.ToTable("OrganizerOrganizationTypes");

            builder.HasKey(o => o.Id);

            builder.HasOne(o => o.Organizer)
                   .WithMany(o => o.OrganizerOrganiztionTypes)
                   .HasForeignKey(o => o.OrganizerId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(o => o.OrganizationType)
                   .WithMany(o => o.OrganizerOrganiztionTypes)
                   .HasForeignKey(o => o.OrganizationTypeId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
