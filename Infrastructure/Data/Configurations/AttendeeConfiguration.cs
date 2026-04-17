using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Infrastructure.Data.Configurations
{
    public class AttendeeConfiguration : IEntityTypeConfiguration<Attendee>
    {
        public void Configure(EntityTypeBuilder<Attendee> A)
        {
            A.ToTable("Attendees");

            A.HasKey(a => a.AttendeeId);

            A.Property(a => a.LoyaltyPoint)
                   .IsRequired()
                   .HasDefaultValue(0); 

            A.HasOne(a => a.ApplicationUser)
                   .WithOne(u => u.Attendee) 
                   .HasForeignKey<Attendee>(a => a.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Cascade); 
        }
    }
}
