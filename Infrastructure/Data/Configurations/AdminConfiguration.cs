using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Configurations
{
    public class AdminConfiguration : IEntityTypeConfiguration<Admin>
    {
        public void Configure(EntityTypeBuilder<Admin> A)
        {
            A.ToTable("Admins");

            A.HasKey(a => a.AdminId);

            A.HasOne(a => a.ApplicationUser)
                   .WithOne(u => u.Admin)
                   .HasForeignKey<Admin>(a => a.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
