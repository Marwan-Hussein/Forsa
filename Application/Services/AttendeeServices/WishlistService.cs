using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using Domain.Entities;
using Domain.Entities.EventEntities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.AttendeeServices
{
    public class WishlistService : IWishlistService
    {
        private readonly IQueryableRepository<WishListItem> _wishlistRepo;
        private readonly IQueryableRepository<Event> _eventRepo;
        private readonly IUnitOfWork _unitOfWork;

        public WishlistService(
            IQueryableRepository<WishListItem> wishlistRepo,
            IQueryableRepository<Event> eventRepo,
            IUnitOfWork unitOfWork)
        {
            _wishlistRepo = wishlistRepo;
            _eventRepo = eventRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<WishlistEventDto>> GetWishlistAsync(int attendeeId)
        {
            var wishlist = await _wishlistRepo.GetQueryable()
                .Include(w => w.Events)
                .FirstOrDefaultAsync(w => w.AttendeeId == attendeeId && !w.IsDeleted);

            if (wishlist == null || wishlist.Events == null)
                return new List<WishlistEventDto>();

            return wishlist.Events
                .Where(e => !e.IsDeleted)
                .Select(e => new WishlistEventDto
                {
                    EventId = e.Id,
                    Title = e.Title,
                    Category = e.Category,
                    TicketPrice = e.TicketPrice,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    Status = e.Status.ToString()
                })
                .OrderBy(e => e.StartDate)
                .ToList();
        }

        public async Task AddToWishlistAsync(int attendeeId, int eventId)
        {
            // Verify event exists
            var eventEntity = await _eventRepo.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);

            if (eventEntity == null)
                throw new KeyNotFoundException("Event not found.");

            // Find or create the wishlist for this attendee
            var wishlist = await _wishlistRepo.GetQueryable()
                .Include(w => w.Events)
                .FirstOrDefaultAsync(w => w.AttendeeId == attendeeId && !w.IsDeleted);

            if (wishlist == null)
            {
                wishlist = new WishListItem
                {
                    AttendeeId = attendeeId,
                    Events = new List<Event>(),
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                await _wishlistRepo.AddAsync(wishlist);
            }

            // Check if event is already in wishlist
            if (wishlist.Events.Any(e => e.Id == eventId))
                throw new InvalidOperationException("Event is already in your wishlist.");

            wishlist.Events.Add(eventEntity);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task RemoveFromWishlistAsync(int attendeeId, int eventId)
        {
            var wishlist = await _wishlistRepo.GetQueryable()
                .Include(w => w.Events)
                .FirstOrDefaultAsync(w => w.AttendeeId == attendeeId && !w.IsDeleted);

            if (wishlist == null)
                throw new KeyNotFoundException("Wishlist not found.");

            var eventToRemove = wishlist.Events?.FirstOrDefault(e => e.Id == eventId);
            if (eventToRemove == null)
                throw new KeyNotFoundException("Event is not in your wishlist.");

            wishlist.Events.Remove(eventToRemove);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
