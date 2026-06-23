namespace Application.Core.DTOs.Place
{
    public class PlaceMediaDto
    {
        public int MediaId { get; set; }
        public string MediaURL { get; set; }
        public string MediaType { get; set; }
        public int PlaceId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
