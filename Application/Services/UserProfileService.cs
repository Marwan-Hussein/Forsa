using Application.Core.DTOs.Organizer;
using Application.Core.DTOs.Owner;
using Application.Core.DTOs.UserDTOs;
using Application.Core.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env;

        public UserProfileService(UserManager<ApplicationUser> userManager, IMapper mapper, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
            _userManager = userManager;
            _mapper = mapper;
            _env = env;
        }

        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null || user.IsDeleted) return null;

            var roles = await _userManager.GetRolesAsync(user);
            var dto = _mapper.Map<UserProfileDto>(user);
            dto.Role = roles.FirstOrDefault() ?? "Unknown";
            return dto;
        }

        public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateUserProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null || user.IsDeleted) return null;

            ApplyBaseUpdates(user, dto);
            user.LastModifiedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            var resultDto = _mapper.Map<UserProfileDto>(user);
            resultDto.Role = roles.FirstOrDefault() ?? "Unknown";
            return resultDto;
        }

        // Organizer

        public async Task<OrganizerProfileDto?> GetOrganizerProfileAsync(int organizerId)
        {
            var user = await _userManager.FindByIdAsync(organizerId.ToString());
            if (user is not Organizer org || org.IsDeleted) return null;

            return _mapper.Map<OrganizerProfileDto>(org);
        }

        public async Task<OrganizerProfileDto?> UpdateOrganizerProfileAsync(int organizerId, UpdateOrganizerProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(organizerId.ToString());
            if (user is not Organizer org || org.IsDeleted) return null;

            ApplyBaseUpdates(org, dto);

            if (!string.IsNullOrWhiteSpace(dto.OrganizationName))
                org.OrganizationName = dto.OrganizationName.Trim();

            org.LastModifiedAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(org);

            return _mapper.Map<OrganizerProfileDto>(org);
        }

        // Owner

        public async Task<OwnerProfileDto?> GetOwnerProfileAsync(int ownerId)
        {
            var user = await _userManager.FindByIdAsync(ownerId.ToString());
            if (user is not Owner owner || owner.IsDeleted) return null;

            return _mapper.Map<OwnerProfileDto>(owner);
        }

        public async Task<OwnerProfileDto?> UpdateOwnerProfileAsync(int ownerId, UpdateOwnerProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(ownerId.ToString());
            if (user is not Owner owner || owner.IsDeleted) return null;

            ApplyBaseUpdates(owner, dto);
            owner.LastModifiedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(owner);

            return _mapper.Map<OwnerProfileDto>(owner);
        }

        // Owner

        public async Task<string> UploadProfilePictureAsync(int userId, Microsoft.AspNetCore.Http.IFormFile file)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null || user.IsDeleted) throw new KeyNotFoundException("User not found");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            if (!allowedExtensions.Contains(extension))
                throw new InvalidOperationException("Invalid image format. Allowed: .jpg, .jpeg, .png");

            var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "profiles", userId.ToString());
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/profiles/{userId}/{fileName}";
            
            // Delete old picture if exists
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                var oldPath = Path.Combine(_env.WebRootPath ?? "wwwroot", user.ProfilePicture.TrimStart('/'));
                if (File.Exists(oldPath)) File.Delete(oldPath);
            }

            user.ProfilePicture = relativePath;
            user.LastModifiedAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return relativePath;
        }

        public async Task<bool> RemoveProfilePictureAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null || user.IsDeleted) throw new KeyNotFoundException("User not found");

            if (string.IsNullOrEmpty(user.ProfilePicture)) return false;

            // Delete physical file
            var physicalPath = Path.Combine(_env.WebRootPath ?? "wwwroot", user.ProfilePicture.TrimStart('/'));
            if (File.Exists(physicalPath)) File.Delete(physicalPath);

            user.ProfilePicture = null;
            user.LastModifiedAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return true;
        }

        // Private helpers
        private void ApplyBaseUpdates(ApplicationUser user, UpdateUserProfileDto dto)
        {
            user.FullName = dto.FullName.Trim();
            user.PhoneNumber = dto.PhoneNumber.Trim();
            user.Location = dto.Location.Trim();
            user.BirthDate = dto.BirthDate;
        }
    }
}
