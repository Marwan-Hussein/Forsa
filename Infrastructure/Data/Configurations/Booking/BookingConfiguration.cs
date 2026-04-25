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

            builder.HasKey(b => b.Id);

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

            builder.HasData(
                new Booking
                {
                    Id = 1,
                    AttendeeId = 2,
                    EventId = 1,
                    NumberOfTickets = 1,
                    Status = Domain.ENUMs.BookingStatus.Confirmed,
                    BookingDate = new DateTime(2027, 4, 1, 10, 0, 0),
                    QRCode = "QR_1234567890",
                    CreatedAt = new DateTime(2026, 1, 15),
                    IsDeleted = false
                },
                new Booking
                {
                    Id = 2,
                    AttendeeId = 2,
                    EventId = 2,
                    NumberOfTickets = 2,
                    Status = Domain.ENUMs.BookingStatus.Confirmed,
                    BookingDate = new DateTime(2027, 4, 5, 14, 30, 0),
                    QRCode = "QR_0987654321",
                    CreatedAt = new DateTime(2026, 1, 16),
                    IsDeleted = false
                }
            );
        }
    }
}