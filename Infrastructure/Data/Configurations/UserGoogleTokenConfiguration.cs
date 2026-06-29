using Domain.Entities.AuthEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    internal class UserGoogleTokenConfiguration : IEntityTypeConfiguration<UserGoogleToken>
    {
        public void Configure(EntityTypeBuilder<UserGoogleToken> builder)
        {
            builder.ToTable("UserGoogleTokens");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Id)
                .ValueGeneratedOnAdd();

            builder.HasOne(t => t.User)
                .WithOne()
                .HasForeignKey<UserGoogleToken>(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(t => t.UserId)
                .IsUnique();

            builder.Property(t => t.GoogleEmail)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(t => t.AccessToken)
                .IsRequired();

            builder.Property(t => t.RefreshToken)
                .IsRequired();

            builder.Property(t => t.TokenExpiration)
                .IsRequired();
        }
    }
}