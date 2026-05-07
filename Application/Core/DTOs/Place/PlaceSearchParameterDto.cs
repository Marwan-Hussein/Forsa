namespace Application.Core.DTOs.Place
{
    public class PlaceSearchParameterDto
    {
        public string? Name { get; set; }
        public string? Location { get; set; }
        public string? SortBy { get; set; } // name/location/date
        public bool IsDescending { get; set; }
    }
}
