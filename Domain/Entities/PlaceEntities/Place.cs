using Domain.Common.Implementation;
using Domain.Entities.OwnerEntities;
using Domain.ENUMs;

namespace Domain.Entities.PlaceEntities
{
    public class Place : BaseEntity
    {
        public string Name { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public string Description { get; set; }
        public decimal HourlyPrice { get; set; }
        public decimal DailyPrice { get; set; }
        public PlaceStatus Status { get; set; }
        public FacilityName FacilityName { get; set; }
        public bool IsLocked { get; set; }
        public string? Reason { get; set; }

        // Relationships
        public List<PlaceMedia> PlaceMedias { get; set; }
        public Owner Owner { get; set; }
        public int? OwnerId { get; set; }
        // 1 to many place to booking request
        // to do

        // 1 to many place to FeedBack
        // to do
    }
}
