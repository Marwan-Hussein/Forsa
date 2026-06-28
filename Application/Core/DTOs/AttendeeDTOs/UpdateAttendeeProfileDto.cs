using Application.Core.DTOs.UserDTOs;

namespace Application.Core.DTOs.AttendeeDTOs
{
    public class UpdateAttendeeProfileDto : UpdateUserProfileDto
    {
        // Attendee has no extra updatable fields beyond base.
        // LoyaltyPoint is system-managed, Interests have their own endpoint.
    }
}
