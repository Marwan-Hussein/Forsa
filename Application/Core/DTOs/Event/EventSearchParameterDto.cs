using Domain.ENUMs;

namespace Application.Core.DTOs.Event
{
    public class EventSearchParameterDto
    {
        public string? EventName { get; set; }
        public string? EventLocation { get; set; }
        public string? EventCategory { get; set; }
        public EventStatus? Status { get; set; }
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; }
    }
}
