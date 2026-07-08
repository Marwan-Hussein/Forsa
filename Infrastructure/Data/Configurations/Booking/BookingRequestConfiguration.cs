using Domain.Entities.BookingEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class BookingRequestConfiguration : IEntityTypeConfiguration<BookingRequest>
    {
        public void Configure(EntityTypeBuilder<BookingRequest> builder)
        {
            builder.ToTable("BookingRequests");

            builder.HasKey(b => b.Id);

            builder.HasOne(b => b.Organizer)
                   .WithMany(o => o.BookingRequests)
                   .HasForeignKey(b => b.OrganizerId)
                   .OnDelete(DeleteBehavior.NoAction);

            // Place is related
            builder.HasOne(b => b.Place)
                   .WithMany()
                   .HasForeignKey(b => b.PlaceId)
                   .OnDelete(DeleteBehavior.NoAction);

            // Event is related
            builder.HasOne(b => b.Event)
                   .WithMany()
                   .HasForeignKey(b => b.EventId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
