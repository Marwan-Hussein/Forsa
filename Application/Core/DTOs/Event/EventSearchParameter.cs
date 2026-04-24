namespace Application.Core.DTOs.Event
{
    public class EventSearchParameter
    {
        public string? EventName { get; set; }
        public string? EventLocation { get; set; }
        public string? EventCategory { get; set; }
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; }
    }
}
