using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class EventMediaConfiguration : IEntityTypeConfiguration<EventMedia>
    {
        public void Configure(EntityTypeBuilder<EventMedia> builder)
        {
            builder.ToTable("EventMedias");

            builder.HasKey(m => m.EventMediaId);

            builder.Property(m => m.MediaUrl)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(m => m.MediaType)
                   .HasMaxLength(50);

            // EventMedia & Event
            builder.HasOne(m => m.Event)
                   .WithMany(e => e.EventMedias)
                   .HasForeignKey(m => m.EventId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}