using Application.Core.DTOs.UserDTOs;

namespace Application.Core.DTOs.Organizer
{
    public class OrganizerProfileDto : UserProfileDto
    {
        public string OrganizationName { get; set; }
        public double AverageRating { get; set; }
        public int ReviewsCount { get; set; }
    }
}
