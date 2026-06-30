namespace Application.Core.DTOs.Place
{
    public class PlaceSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public decimal DailyPrice { get; set; }
        public List<string> Images { get; set; } = new();
        public string FacilityName { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public List<PlaceAvailabilityDto> Availabilities { get; set; } = new();
    }
}
