using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AttendeeInterestConfiguration : IEntityTypeConfiguration<AttendeeInterest>
    {
        public void Configure(EntityTypeBuilder<AttendeeInterest> AI)
        {
            AI.ToTable("AttendeeInterests");

            AI.HasKey(ai => ai.InterestId);

            AI.HasOne(ai => ai.Attendee)
                   .WithMany() 
                   .HasForeignKey(ai => ai.AttendeeId)
                   .OnDelete(DeleteBehavior.Cascade);

            AI.HasOne(ai => ai.Attendee)
                   .WithMany(a => a.AttendeeInterests)
                   .HasForeignKey(ai => ai.AttendeeId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
