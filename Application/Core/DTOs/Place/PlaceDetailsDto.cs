namespace Application.Core.DTOs.Place
{
    public class PlaceDetailsDto
    {
        public int PlaceId { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public string Description { get; set; }
        public decimal HourlyPrice { get; set; }
        public decimal DailyPrice { get; set; }
        public string Status { get; set; } // PlaceStatus enum as readable string
        public string FacilityName { get; set; } // FacilityName enum as readable string
        public bool IsLocked { get; set; }
        public string? Reason { get; set; }
        public int? OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? GooglePlaceId { get; set; }

        public string? OwnerName { get; set; }
        public string? OwnerEmail { get; set; }
        public string? OwnerPhone { get; set; }

        public List<string> Images { get; set; } = new();
        public List<PlaceAvailabilityDto> Availabilities { get; set; } = new();
        
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
    }
}
