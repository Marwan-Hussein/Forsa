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
    public class PayoutMethodConfiguration : IEntityTypeConfiguration<PayoutMethod>
    {
        public void Configure(EntityTypeBuilder<PayoutMethod> builder)
        {
            builder.ToTable("PayoutMethods");
            builder.HasKey(x => x.PayoutMethodId);

            builder.Property(x => x.Type)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.AccountNumber)
                   .HasMaxLength(100) 
                   .IsRequired();

            builder.Property(x => x.AccountHolderName)
                   .HasMaxLength(150)
                   .IsRequired();

            builder.HasOne(x => x.ApplicationUser)
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
