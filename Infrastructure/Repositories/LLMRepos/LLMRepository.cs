using Domain.Entities.BookingEntities;
using Domain.Interfaces;
using Domain.Interfaces.BookingInterfaces;
using Domain.Interfaces.LLMInterfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.LLM
{
    public class LLMRepository : ILLMRepository
    {
        private readonly ForsaDbContext _context;
        private readonly IPlaceRepository _placeRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IQueryableRepository<Booking> _queryableRepository;

        public LLMRepository(
            ForsaDbContext context,
            IPlaceRepository placeRepository,
            IBookingRepository bookingRepository,
            IEventRepository eventRepository,
            IQueryableRepository<Booking> queryableRepository)
        {
            _context = context;
            _placeRepository = placeRepository;
            _bookingRepository = bookingRepository;
            _eventRepository = eventRepository;
            _queryableRepository = queryableRepository;
        }

        public async Task<string> GetEntityDetailedProfileAsync(string entityType, string entityIdentifier)
        {
            if (entityType.ToLower() == "venue")
            {
                var venue = await _placeRepository.GetPlaceByEntityIdentifier(entityIdentifier);
                if (venue == null) return "Sorry, I couldn't find any details about this venue.";

                return $"Venue Name: {venue.Name}, Location: {venue.Location}, Max Capacity: {venue.Capacity} people, Features: {venue.Description}.";
            }
            else
            {
                var @event = await _eventRepository.GetEventByEntityIdentifier(entityIdentifier);
                if (@event == null) return "Sorry, I couldn't find any event with this name.";

                return $"Event: {@event.Title}, Category: {@event.Category}, Venue Location: {@event.Place.Location}, Date: {@event.StartDate:dd/MM/yyyy hh:mm tt}, Ticket Prices Start From: {@event.TicketPrice} EGP, Remaining Tickets: {@event.RemainingTickets}.";
            }
        }

        public async Task<string> GetLiveInventoryAsync(int eventId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId);
            if (@event == null) return "The specified event does not exist.";

            var totalSales = @event.TotalTickets - @event.RemainingTickets;
            var totalRevenue = totalSales * @event.TicketPrice;

            return $"Event: {@event.Title} | Tickets Sold: {totalSales}/{@event.TotalTickets} | Remaining Tickets: {@event.RemainingTickets} | Current Total Revenue: {totalRevenue} EGP.";
        }

        public async Task<string> GetUserHistoryAndStatusAsync(string userId)
        {
            var bookings = await _bookingRepository.GetBookingsByUserIdAsync(userId);

            if (!bookings.Any()) return "You do not have any bookings or tickets registered under your account on the platform yet.";

            return "Your Recent Bookings:\n" + string.Join("\n", bookings.Select(b => $"- Ticket for [{b.Event.Title}] on {b.BookingDate:dd/MM/yyyy} | Ticket Status: {b.Status}"));
        }

        public async Task<string> SearchPlatformRegistryAsync(string searchType, string keyword, string location, string date)
        {
            if (searchType.ToLower() == "venues")
            {
                var venueQuery = _placeRepository.GetQueryable();
                if (!string.IsNullOrEmpty(keyword)) venueQuery = venueQuery.Where(v => v.Name.Contains(keyword) || v.Description.Contains(keyword));
                if (!string.IsNullOrEmpty(location)) venueQuery = venueQuery.Where(v => v.Location.Contains(location));

                var venues = await venueQuery.Take(3).ToListAsync();
                if (!venues.Any()) return "No halls or venues match your search criteria at the moment.";

                return "Available Venues:\n" + string.Join("\n", venues.Select(v => $"- Venue [{v.Name}] in {v.Location}, Capacity: {v.Capacity} people."));
            }
            else // Default: events
            {
                var eventQuery = _eventRepository.GetQueryableWithPlace();
                if (!string.IsNullOrEmpty(keyword)) eventQuery = eventQuery.Where(e => e.Title.Contains(keyword) || e.Category.Contains(keyword));
                if (!string.IsNullOrEmpty(location)) eventQuery = eventQuery.Where(e => e.Place.Location.Contains(location));
                if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var parsedDate)) eventQuery = eventQuery.Where(e => e.StartDate.Date == parsedDate.Date);

                var events = await eventQuery.Where(e => e.StartDate >= DateTime.UtcNow).Take(3).ToListAsync();
                if (!events.Any()) return "No upcoming events match your search criteria at the moment.";

                return "Available Events:\n" + string.Join("\n", events.Select(e => $"- Event [{e.Title}] at {e.Place.Location} on {e.StartDate:dd/MM/yyyy}"));
            }
        }

        public async Task<string> GetPlatformOverviewStatsAsync()
        {
            var totalEvents = await _eventRepository.GetQueryableWithPlace().CountAsync();

            var upcomingEvents = await _eventRepository.GetQueryable().CountAsync(e => e.StartDate >= DateTime.UtcNow);

            var totalTicketsSold = await _eventRepository.GetQueryable()
                .SumAsync(e => e.TotalTickets - e.RemainingTickets);

            var totalPlatformRevenue = await _eventRepository.GetQueryable()
                .Select(e => (e.TotalTickets - e.RemainingTickets) * e.TicketPrice)
                .SumAsync();

            return $"Current Forsa Platform Administrative Statistics:\n" +
                   $"- Total Registered Events: {totalEvents}\n" +
                   $"- Active Upcoming Events: {upcomingEvents}\n" +
                   $"- Total Tickets Sold: {totalTicketsSold}\n" +
                   $"- Total Platform Sales Revenue: {totalPlatformRevenue} EGP.";
        }
    }
}