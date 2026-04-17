using Domain.Entities.BookingEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Bookings");

            builder.HasKey(b => b.BookingId);

            builder.Property(b => b.NumberOfTickets)
                   .IsRequired();

            builder.Property(b => b.BookingDate)
                   .IsRequired();

            builder.Property(b => b.QRCode)
                   .HasMaxLength(500);

            // Booking & Attendee
            // restrict because when the Attendee is deleted we want to keep the Booking records for reference purposes?
            builder.HasOne(b => b.Attendee)
                   .WithMany(a => a.Bookings)
                   .HasForeignKey(b => b.AttendeeId)
                   .OnDelete(DeleteBehavior.NoAction);

            // Booking & Event
            // cascade (if the event is deleted we want to delete all related Bookings)
            builder.HasOne(b => b.Event)
                   .WithMany(e => e.Bookings)
                   .HasForeignKey(b => b.EventId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}