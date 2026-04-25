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

            builder.HasData(
                new Event
                {
                    EventId = 1,
                    Title = "Tech Innovators Summit",
                    Description = "A summit for technology innovators to share ideas and connect.",
                    Category = "Technology",
                    TicketPrice = 150.00,
                    TotalTickets = 500,
                    RemainingTickets = 450,
                    StartDate = new DateTime(2027, 5, 10, 9, 0, 0),
                    EndDate = new DateTime(2027, 5, 12, 17, 0, 0),
                    PlaceId = 1,
                    Place = "Main Hall, Tech Center",
                    IsDeleted = false,
                    CreatedAt = new DateTime(2026, 1, 1),
                    Status = Domain.ENUMs.EventStatus.Draft
                },
                new Event
                {
                    EventId = 2,
                    Title = "Global Business Conference",
                    Description = "An international conference on modern business strategies.",
                    Category = "Business",
                    TicketPrice = 200.00,
                    TotalTickets = 300,
                    RemainingTickets = 150,
                    StartDate = new DateTime(2027, 6, 15, 10, 0, 0),
                    EndDate = new DateTime(2027, 6, 17, 18, 0, 0),
                    PlaceId = 2,
                    Place = "Conference Center B",
                    IsDeleted = false,
                    CreatedAt = new DateTime(2026, 1, 2),
                    Status = Domain.ENUMs.EventStatus.Draft
                }
            );

            // 2. Event & EventMedia
            builder.HasMany(e => e.EventMedias)
                   .WithOne(em => em.Event)
                   .HasForeignKey(em => em.EventId)
                   .OnDelete(DeleteBehavior.NoAction);

            // 3. Event & Feedbacks
            builder.HasMany(e => e.Feedbacks)
                   .WithOne(f => f.Event)
                   .HasForeignKey(f => f.EventId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}