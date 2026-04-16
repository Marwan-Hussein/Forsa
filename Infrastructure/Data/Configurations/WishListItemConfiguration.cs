using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Entities;

namespace Infrastructure.Data.Configurations
{
    public class WishlistItemConfiguration : IEntityTypeConfiguration<WishListItem>
    {
        public void Configure(EntityTypeBuilder<WishListItem> builder)
        {
            builder.ToTable("WishlistItems");
            builder.HasKey(w => w);

            builder.HasOne(w => w.Attendee)
                   .WithOne(a => a.WishList) 
                   .HasForeignKey<WishListItem>(w => w.AttendeeId) 
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
