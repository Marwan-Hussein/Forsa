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

            builder.HasKey(b => b.RequestId);

            builder.HasOne(b => b.Organizer)
                   .WithMany()
                   .HasForeignKey(b => b.OrganizerId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Place is related
            builder.HasOne(b => b.Place)
                   .WithMany()
                   .HasForeignKey(b => b.PlaceId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
