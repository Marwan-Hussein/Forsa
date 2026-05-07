using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Auth
{
    public class ExternalAuthService(UserManager<ApplicationUser> userManager,
                                      IJwtService jwtService,
                                      IRefreshTokenService refreshTokenService) : IExternalAuthService
    {
        public async Task<ExternalAuthResponseDto> ProcessExternalLoginAsync(ExternalAuthDto dto)
        {
            // 1. Check if the user Exist in the DB
            var user = await userManager.FindByLoginAsync(dto.Provider, dto.ProviderKey);
            // no user found 
            if (user == null)
            {
                // Check if the user exist with the same email
                user = await userManager.FindByEmailAsync(dto.Email);
                // there is email 
                if (user != null)
                {
                    var result = await userManager.AddLoginAsync(user, new UserLoginInfo(dto.Provider, dto.ProviderKey, dto.Provider));
                    if (!result.Succeeded)
                    {

                        return new ExternalAuthResponseDto
                        {
                            IsSuccess = false,
                            Message = "Failed to link provider."
                        };
                    }
                }
                // no user in the DB  --> create  new user
                else
                {
                    user = new ApplicationUser
                    {
                        UserName = dto.Email,
                        Email = dto.Email,
                        FullName = dto.Name,
                        EmailConfirmed = true,
                        Location = "Not Specified",
                    };

                    var result = await userManager.CreateAsync(user);
                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        return new ExternalAuthResponseDto { IsSuccess = false, Message = $"User registration failed: {errors}" };
                    }

                    var linkedResult = await userManager.AddLoginAsync(user, new UserLoginInfo(dto.Provider, dto.ProviderKey, dto.Provider));
                    if (!linkedResult.Succeeded)
                    {
                        await userManager.DeleteAsync(user);
                        return new ExternalAuthResponseDto { IsSuccess = false, Message = "Failed to link provider." };
                    }

                    // Define which roles a user is allowed to "choose" during social login
                    var allowedRoles = new List<string> { "Attendee", "Organizer", "Owner" };

                    // Determine which role to assign (Fallback to "Attendee" if the DTO value is invalid)
                    var roleToAssign = allowedRoles.Contains(dto.RequestedRole) ? dto.RequestedRole : "Attendee";

                    await userManager.AddToRoleAsync(user, roleToAssign);
                }

            }
            var role = await userManager.GetRolesAsync(user);
            var token = jwtService.GenerateToken(user, role);
            var refreshToken = refreshTokenService.CreateRefreshToken(token);
            return new ExternalAuthResponseDto
            {
                IsSuccess = true,
                Message = "Authentication successful",
                User = new UserDto
                {
                    FullName = user.FullName,
                    Email = user.Email,
                    Token = token,
                    RefreshToken = refreshToken.Token,
                    ExpireOn = refreshToken.ExpiresOn
                }

            };
        }
    
    }
}
