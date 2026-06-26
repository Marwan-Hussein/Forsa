using Application.Core.DTOs.UserDTOs;

namespace Application.Core.DTOs.AttendeeDTOs
{
    public class AttendeeProfileDto : UserProfileDto
    {
        public int LoyaltyPoint { get; set; }
        public List<InterestDto> Interests { get; set; } = new();
    }
}
