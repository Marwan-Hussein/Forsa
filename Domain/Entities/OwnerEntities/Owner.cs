using Domain.Entities.PlaceEntities;

namespace Domain.Entities.OwnerEntities
{
    public class Owner : ApplicationUser
    {

        // Relationships
        public List <Place> Places { get; set; }
    }
}
