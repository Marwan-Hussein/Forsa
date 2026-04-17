using Domain.Entities.AttendeeEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AttendeeAttendeeInterestsConfiguration : IEntityTypeConfiguration<AttendeeAttendeeInterestes>
    {
        public void Configure(EntityTypeBuilder<AttendeeAttendeeInterestes> builder)
        {
            builder.ToTable("AttendeeAttendeeInterests");

            builder.HasKey(a => a.Id);

            builder.HasOne(a => a.Attendee)
                   .WithMany()
                   .HasForeignKey(a => a.AttendeeId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.AttendeeInterest)
                   .WithMany()
                   .HasForeignKey(a => a.AttendeeInterestId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
