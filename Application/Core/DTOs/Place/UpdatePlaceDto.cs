namespace Application.Core.DTOs.Place
{
    public class UpdatePlaceDto
    {
        public string? Name { get; set; }
        public string? Location { get; set; }
        public int? Capacity { get; set; }
        public string? Description { get; set; }
        public decimal? HourlyPrice { get; set; }
        public decimal? DailyPrice { get; set; }
        public int? FacilityName { get; set; }
    }
}
