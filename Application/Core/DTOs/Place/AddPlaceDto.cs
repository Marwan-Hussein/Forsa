namespace Application.Core.DTOs.Place
{
    public class AddPlaceDto
    {
        public string Name { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public string Description { get; set; }
        public decimal HourlyPrice { get; set; }
        public decimal DailyPrice { get; set; }
        public int FacilityName { get; set; } // FacilityName enum int value
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? GooglePlaceId { get; set; }
        public string? AvailableDays { get; set; }
    }
}
