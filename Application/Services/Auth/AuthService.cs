using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using Application.Core.Settings;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.AuthEntities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Application.Services.Auth
{
    public class AuthService(IMapper mapper,
        UserManager<ApplicationUser> userManager,
        IJwtService jwtService,
        IRefreshTokenService refreshTokenService,
        IOptions<JwtSettings> jwtSettings) : IAuthService
    {
        private readonly JwtSettings _jwtSettings = jwtSettings.Value;

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            var emailExist = await userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            var user = mapper.Map<ApplicationUser>(registerDto);
            var refreshToken = refreshTokenService.GenerateToken();
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(refreshToken));

            var result = await userManager.CreateAsync(user, registerDto.Password);
            HandleResult(result, "User creation failed");

            return CreateUserDto(user, refreshToken);
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                throw new Exception("Invalid email or password.");

            var passwordValid = await userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid)
                throw new Exception("Invalid email or password.");

            var refreshToken = refreshTokenService.GenerateToken();
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(refreshToken));

            var result = await userManager.UpdateAsync(user);
            HandleResult(result, "Refresh token creation failed");

            return CreateUserDto(user, refreshToken);
        }

        public async Task<UserDto> RefreshTokenAsync(RefreshTokenRequestDto refreshTokenRequestDto)
        {
            var (user, oldRefreshToken) = await GetUserByRefreshTokenAsync(refreshTokenRequestDto.RefreshToken);
            oldRefreshToken.RevokedOn = DateTime.UtcNow;

            var newRefreshToken = refreshTokenService.GenerateToken();
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(newRefreshToken));

            var result = await userManager.UpdateAsync(user);
            HandleResult(result, "Refresh token rotation failed");

            return CreateUserDto(user, newRefreshToken);
        }

        public async Task RevokeRefreshTokenAsync(RefreshTokenRequestDto refreshTokenRequestDto)
        {
            var (user, refreshToken) = await GetUserByRefreshTokenAsync(refreshTokenRequestDto.RefreshToken);
            refreshToken.RevokedOn = DateTime.UtcNow;

            var result = await userManager.UpdateAsync(user);
            HandleResult(result, "Refresh token revocation failed");
        }

        private async Task<(ApplicationUser User, RefreshToken RefreshToken)> GetUserByRefreshTokenAsync(string token)
        {
            var user = await userManager.Users.SingleOrDefaultAsync(u =>
                u.RefreshTokens.Any(t => t.Token == token));

            if (user == null)
                throw new Exception("Invalid refresh token.");

            var refreshToken = user.RefreshTokens.Single(t => t.Token == token);
            if (!refreshToken.IsActive)
                throw new Exception("Invalid refresh token.");

            return (user, refreshToken);
        }

        private UserDto CreateUserDto(ApplicationUser user, string refreshToken)
        {
            return new UserDto
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = jwtService.GenerateToken(user),
                ExpireOn = DateTime.UtcNow.AddMinutes(_jwtSettings.JWTDurationInMinutes),
                RefreshToken = refreshToken
            };
        }

        private static void HandleResult(IdentityResult result, string message)
        {
            if (result.Succeeded)
                return;

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"{message}: {errors}");
        }
    }
}
