using Domain.Entities.EventEntities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.ToTable("Events");

            builder.HasKey(e => e.EventId);

            builder.Property(e => e.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(e => e.Description)
                   .HasMaxLength(1000);

            builder.Property(e => e.Category)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(e => e.TicketPrice)
                   .IsRequired();

            builder.Property(e => e.TotalTickets)
                   .IsRequired();

            builder.Property(e => e.RemainingTickets)
                   .IsRequired();

            builder.Property(e => e.StartDate)
                   .IsRequired();

            builder.Property(e => e.EndDate)
                   .IsRequired();

            // Organizer is required for an event
            //builder.HasOne(e => e.Organizer)
            //       .WithMany() 
            //       .HasForeignKey(e => e.OrganizerId)
            //       .OnDelete(DeleteBehavior.Restrict);

            // 2. Event & EventMedia
            builder.HasMany(e => e.EventMedias)
                   .WithOne(em => em.Event)
                   .HasForeignKey(em => em.EventId)
                   .OnDelete(DeleteBehavior.SetNull);

            // 3. Event & Feedbacks
            builder.HasMany(e => e.Feedbacks)
                   .WithOne(f => f.Event)
                   .HasForeignKey(f => f.EventId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}