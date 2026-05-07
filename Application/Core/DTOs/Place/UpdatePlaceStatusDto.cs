using Domain.ENUMs;

namespace Application.Core.DTOs.Place
{
    public class UpdatePlaceStatusDto
    {
        public PlaceStatus Status { get; set; }
        public string? Reason { get; set; }  // Required when Status == Rejected
    }
}
