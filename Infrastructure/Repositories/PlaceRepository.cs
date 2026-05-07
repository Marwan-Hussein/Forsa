using Domain.Entities.PlaceEntities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;

namespace Infrastructure.Repositories
{
    public class PlaceRepository : QueryableRepository<Place>, IPlaceRepository
    {
        public PlaceRepository(ForsaDbContext context) : base(context) { }
    }
}
