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
