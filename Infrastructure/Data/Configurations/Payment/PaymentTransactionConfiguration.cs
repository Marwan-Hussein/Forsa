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
    public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
    {
        public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
        {
            builder.ToTable("PaymentTransactions");
            builder.HasKey(x => x.PaymentId);

            builder.Property(x => x.Amount)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(x => x.Currency)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(x => x.PaymobIntentionId)
                   .HasMaxLength(255)
                   .IsRequired(false);

            builder.Property(x => x.PaymobTransactionId)
                   .HasMaxLength(255)
                   .IsRequired(false); 

            builder.Property(x => x.ItemType)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.TransactionStatus)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.HasOne(x => x.ApplicationUser)
                   .WithMany() 
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.PaymobTransactionId).IsUnique();
            builder.HasIndex(x => x.PaymobIntentionId).IsUnique();

            builder.HasIndex(x => new { x.ItemType, x.ReferenceId });
        }
    }
}
