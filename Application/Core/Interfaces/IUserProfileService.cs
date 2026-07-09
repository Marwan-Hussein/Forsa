using Application.Core.DTOs.Organizer;
using Application.Core.DTOs.Owner;
using Application.Core.DTOs.UserDTOs;

namespace Application.Core.Interfaces
{
    public interface IUserProfileService
    {
        // Generic profile (works for any role)
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateUserProfileDto dto);
        Task<string> UploadProfilePictureAsync(int userId, Microsoft.AspNetCore.Http.IFormFile file);
        Task<bool> RemoveProfilePictureAsync(int userId);

        // Organizer-specific
        Task<OrganizerProfileDto?> GetOrganizerProfileAsync(int organizerId);
        Task<OrganizerProfileDto?> UpdateOrganizerProfileAsync(int organizerId, UpdateOrganizerProfileDto dto);

        // Owner-specific
        Task<OwnerProfileDto?> GetOwnerProfileAsync(int ownerId);
        Task<OwnerProfileDto?> UpdateOwnerProfileAsync(int ownerId, UpdateOwnerProfileDto dto);
    }
}
