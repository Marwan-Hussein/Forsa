using Domain.Entities.AttendeeEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AttendeeInterestConfiguration : IEntityTypeConfiguration<AttendeeInterest>
    {
        public void Configure(EntityTypeBuilder<AttendeeInterest> builder)
        {
            builder.ToTable("AttendeeInterests");
            builder.HasKey(ai => ai.InterestId);

            builder.HasMany(ai => ai.AttendeeInterestes)
                   .WithOne(aii => aii.AttendeeInterest)
                   .HasForeignKey(aii => aii.AttendeeInterestId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
