using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
    {
        public void Configure(EntityTypeBuilder<Feedback> builder)
        {
            builder.ToTable("Feedbacks");

            builder.HasKey(f => f.FeedbackId);

            builder.Property(f => f.Rating)
                   .IsRequired();

            builder.Property(f => f.Comment)
                   .HasMaxLength(500);

            // Feedback & Attendee
            builder.HasOne(f => f.Attendee)
                   .WithMany(a => a.Feedbacks)
                   .HasForeignKey(f => f.AttendeeId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Feedback & Event
            builder.HasOne(f => f.Event)
                   .WithMany(e => e.Feedbacks)
                   .HasForeignKey(f => f.EventId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}