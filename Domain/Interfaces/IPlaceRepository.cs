using Domain.Entities.PlaceEntities;

namespace Domain.Interfaces
{
    public interface IPlaceRepository : IQueryableRepository<Place>
    {
        public Task<Place> GetPlaceByEntityIdentifier(string entityIdentifier);
        //public Task<List<Place>> SearchPlacesByLocationandKeyword(string keyword , string location);
    }
}
