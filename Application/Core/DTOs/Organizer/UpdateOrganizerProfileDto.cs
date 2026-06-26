using Application.Core.DTOs.UserDTOs;

namespace Application.Core.DTOs.Organizer
{
    public class UpdateOrganizerProfileDto : UpdateUserProfileDto
    {
        public string OrganizationName { get; set; } = string.Empty;
    }
}
