using Domain.Entities.EventEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class EventMediaConfiguration : IEntityTypeConfiguration<EventMedia>
    {
        public void Configure(EntityTypeBuilder<EventMedia> builder)
        {
            builder.ToTable("EventMedias");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.MediaUrl)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(m => m.MediaType)
                   .HasMaxLength(50);

            // EventMedia & Event
            builder.HasOne(m => m.Event)
                   .WithMany(e => e.EventMedias)
                   .HasForeignKey(m => m.EventId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}