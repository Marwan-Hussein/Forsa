using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class PromoCodeConfiguration : IEntityTypeConfiguration<PromoCode>
    {
        public void Configure(EntityTypeBuilder<PromoCode> builder)
        {
            builder.ToTable("PromoCodes");

            builder.HasKey(p => p.CodeId);

            // PromoCode & Organizer
            builder.HasOne(p => p.Organizer)
                   .WithMany()
                   .HasForeignKey(p => p.OrganizerId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
