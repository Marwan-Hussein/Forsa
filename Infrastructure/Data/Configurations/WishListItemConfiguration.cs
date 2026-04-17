using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Data.Configurations
{
    public class WishlistItemConfiguration : IEntityTypeConfiguration<WishListItem>
    {
        public void Configure(EntityTypeBuilder<WishListItem> builder)
        {
            builder.ToTable("WishlistItems");
            builder.HasKey(w => w.WishListItemId);

            // Attendee has one WishListItem
            builder.HasOne(w => w.Attendee)
                   .WithOne(a => a.WishListItem)
                   .HasForeignKey<WishListItem>(w => w.AttendeeId)
                   .OnDelete(DeleteBehavior.Cascade);

            // WishListItem has MANY Events
            builder.HasMany(w => w.Events)
                   .WithMany(e => e.WishListItems);
        }
    }
}
