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
    internal class UserConfiguration : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> U)
        {
            U.ToTable("Users");

            //U.HasKey(u => u.UserId);

            //U.Property(u => u.UserName)
            //       .IsRequired()
            //       .HasMaxLength(100);

            //U.Property(u => u.UserEmail)
            //       .IsRequired()
            //       .HasMaxLength(256);

            //U.HasIndex(u => u.UserEmail)
            //       .IsUnique();

            //U.Property(u => u.EncryptedPassword)
            //       .IsRequired()
            //       .HasMaxLength(256); 

            //U.Property(u => u.UserPhone)
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
