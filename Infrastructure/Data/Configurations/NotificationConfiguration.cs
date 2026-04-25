using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    internal class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(n => n.Id);

            builder.HasOne(n => n.User)
                   .WithMany(u => u.Notifications)
                   .HasForeignKey(u => u.UserId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
