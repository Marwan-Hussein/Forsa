using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection;

using Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.AspNet.Identity.EntityFramework;
namespace Infrastructure.Data.DbContexts
{
    public class ForsaDbContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(
                "Server = .; Database = Forsa; Trusted_Connection = True;TrustServerCertificate=True;"
                , b => b.MigrationsAssembly("Forsa")
                );
        }
        
        DbSet<Admin> Admins { get; set; }
        DbSet<Attendee> Attendees { get; set; }
        DbSet<AttendeeInterest> Interests { get; set; }

        DbSet<Notification> Notifications { get; set; }
        DbSet<Owner> Owners { get; set; }
        DbSet<Place> Places { get; set; }
        DbSet<PlaceMedia> PlaceMedias { get; set; }
        DbSet<PromoCode> PromoCodes { get; set; }
        DbSet<ApplicationUser> ApplicationUsers { get; set; }
        DbSet<WishListItem> WishListItems { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
