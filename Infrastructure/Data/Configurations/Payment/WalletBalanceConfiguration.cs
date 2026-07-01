using Domain.Entities.PaymentEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Configurations.Payment
{
    public class WalletBalanceConfiguration : IEntityTypeConfiguration<WalletBalance>
    {
        public void Configure(EntityTypeBuilder<WalletBalance> builder)
        {
            builder.ToTable("WalletBalances");
            builder.HasKey(x => x.WalletId); 

            builder.Property(x => x.PendingBalance)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(x => x.AvailableBalance)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(x => x.TotalWithdrawn)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.HasIndex(x => x.UserId).IsUnique();

            builder.HasOne(x => x.ApplicationUser)
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
