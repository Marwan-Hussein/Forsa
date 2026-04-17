using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    internal class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> U)
        {
            U.ToTable("ApplicationUsers");

            //U.HasKey(u => u.ApplicationUserId);

            //U.Property(u => u.ApplicationUserName)
            //       .IsRequired()
            //       .HasMaxLength(100);

            //U.Property(u => u.ApplicationUserEmail)
            //       .IsRequired()
            //       .HasMaxLength(256);

            //U.HasIndex(u => u.ApplicationUserEmail)
            //       .IsUnique();

            //U.Property(u => u.EncryptedPassword)
            //       .IsRequired()
            //       .HasMaxLength(256); 

            //U.Property(u => u.ApplicationUserPhone)
            //       .IsRequired()
            //       .HasMaxLength(20);

            U.Property(u => u.Location)
                   .IsRequired() 
                   .HasMaxLength(250);

            U.Property(u => u.BirthDate)
                   .IsRequired()
                   .HasColumnType("date"); 

            U.Property(u => u.ProfilePicture)
                   .IsRequired(false) 
                   .HasMaxLength(1000);


        }
    }
}
