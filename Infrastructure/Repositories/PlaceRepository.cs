using Domain.Entities.PlaceEntities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class PlaceRepository : QueryableRepository<Place>, IPlaceRepository
    {
        public PlaceRepository(ForsaDbContext context) : base(context) { }

        public async Task<Place> GetPlaceByEntityIdentifier(string entityIdentifier)
        {
            var place = await _context.Set<Place>()
                .FirstOrDefaultAsync(p => p.Name.Contains(entityIdentifier));
            if (place == null)
                throw new KeyNotFoundException($"Place with identifier '{entityIdentifier}' not found.");
            return place;
        }
        //public async Task<List<Place>> SearchPlacesByLocationandKeyword(string keyword, string location)
        //{
        //    var venueQuery = _context.Set<Place>();
        //    if (!string.IsNullOrEmpty(keyword))
        //    {
        //        venueQuery = await _context.Set<Place>()
        //            .Where(v => v.Name.Contains(keyword) || v.Description.Contains(keyword))
        //            .ToListAsync();
        //    }
                
                
                
                
        //        venueQuery = venueQuery.Where(v => v.Name.Contains(keyword) || v.Description.Contains(keyword));

        //    if (!string.IsNullOrEmpty(location)) venueQuery = venueQuery.Where(v => v.Location.Contains(location));
        //}
    }
}
