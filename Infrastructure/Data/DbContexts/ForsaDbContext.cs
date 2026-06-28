using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Domain.Entities.AuthEntities;

namespace Infrastructure.Data.DbContexts
{
    public class ForsaDbContext(DbContextOptions<ForsaDbContext> options) : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>(options)
    {
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.ApplyConfigurationsFromAssembly(typeof(ForsaDbContext).Assembly);
            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
            builder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
            builder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
            builder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
            builder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
        }
        public DbSet<UserOtp> UserOtps { get; set; }
        public DbSet<UserGoogleToken> UserGoogleTokens { get; set; }
    }
}


