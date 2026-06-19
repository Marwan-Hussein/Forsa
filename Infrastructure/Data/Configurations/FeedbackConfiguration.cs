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

            builder.HasKey(f => f.Id);

            builder.Property(f => f.Rating)
                   .IsRequired();

            builder.Property(f => f.Comment)
                   .HasMaxLength(500);

            // Feedback & Attendee
            builder.HasOne(f => f.Attendee)
                   .WithMany(a => a.Feedbacks)
                   .HasForeignKey(f => f.AttendeeId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.NoAction);

            // Feedback & Owner (owner submitting feedback)
            builder.HasOne(f => f.Owner)
                   .WithMany()
                   .HasForeignKey(f => f.OwnerId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.NoAction);

            // Feedback & Organizer (organizer being reviewed)
            builder.HasOne(f => f.Organizer)
                   .WithMany()
                   .HasForeignKey(f => f.OrganizerId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.NoAction);

            // Feedback & BookingRequest
            builder.HasOne(f => f.BookingRequest)
                   .WithMany()
                   .HasForeignKey(f => f.BookingRequestId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.NoAction);

            // Feedback & Event
            builder.HasOne(f => f.Event)
                   .WithMany(e => e.Feedbacks)
                   .HasForeignKey(f => f.EventId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.NoAction);

            // Feedback & Place
            builder.HasOne(f => f.Place)
                   .WithMany(p => p.Feedbacks)
                   .HasForeignKey(f => f.PlaceId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}