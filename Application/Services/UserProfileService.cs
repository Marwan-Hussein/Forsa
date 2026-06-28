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

        public UserProfileService(UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
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

        // Private helpers
        private void ApplyBaseUpdates(ApplicationUser user, UpdateUserProfileDto dto)
        {
            user.FullName = dto.FullName.Trim();
            user.UserName = dto.UserName.Trim();
            user.NormalizedUserName = user.UserName.ToUpperInvariant();
            user.Email = dto.Email.Trim();
            user.NormalizedEmail = user.Email.ToUpperInvariant();
            user.PhoneNumber = dto.PhoneNumber.Trim();
            user.Location = dto.Location.Trim();
            user.BirthDate = dto.BirthDate;
        }
    }
}
