using Domain.Entities.AttendeeEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AttendeeSubsOrganizerConfiguration : IEntityTypeConfiguration<AttendeeSubsOrganizer>
    {
        public void Configure(EntityTypeBuilder<AttendeeSubsOrganizer> builder)
        {
            builder.ToTable("AttendeeSubsOrganizers");

            builder.HasKey(a => a.Id);

            builder.HasOne(a => a.Attendee)
                   .WithMany(a => a.AttendeeSubsOrganizers)
                   .HasForeignKey(a => a.AttendeeId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(a => a.Organizer)
                   .WithMany(a => a.AttendeeSubsOrganizers)
                   .HasForeignKey(a => a.OrganizerId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
