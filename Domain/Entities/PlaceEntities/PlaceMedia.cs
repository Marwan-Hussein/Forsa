using Domain.Common.Implementation;
using Domain.ENUMs;

namespace Domain.Entities.PlaceEntities
{
    public class PlaceMedia : BaseEntity
    {
        public string MediaURL { get; set; }
        public MediaType MediaType { get; set; }

        public int? PlaceId { get; set; }
        public Place Place { get; set; }
    }
}
