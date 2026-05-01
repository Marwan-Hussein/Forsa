using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using Application.Core.Interfaces.Auth.OTP;
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
        RoleManager<IdentityRole<int>> roleManager,
        IOptions<JwtSettings> jwtSettings,IOTPService _otpService) : IAuthService
    {
        private readonly JwtSettings _jwtSettings = jwtSettings.Value;

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            /*var emailExist = await _userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            var user = _mapper.Map<ApplicationUser>(registerDto);
            user.EmailConfirmed = false;

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
            }
            var token = _jwtService.GenerateToken(user);
            */
            var otpResult = await InitiateRegistrationAsync(registerDto);
            return new UserDto
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                //Token = token,
                ExpireOn = DateTime.UtcNow.AddDays(7)   
            };
        }

        public async Task<OtpResponseDto> InitiateRegistrationAsync(RegisterDto registerDto)
        {
            // Check if email is already taken
            var emailExist = await _userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            // Create the user in the database normally
            var user = mapper.Map<ApplicationUser>(registerDto);
            user.EmailConfirmed = false; // Need to verify OTP

            var refreshToken = refreshTokenService.GenerateToken();
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(refreshToken));

            var result = await userManager.CreateAsync(user, registerDto.Password);
            HandleResult(result, "User creation failed");
            // Determine which role to assign
            string assignedRole = "Attendee"; // default
            
            if (!string.IsNullOrWhiteSpace(registerDto.Role))
            {
                var requestedRole = registerDto.Role.Trim();
                if (requestedRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception("Cannot register as an Admin.");
                }
                
                if (Enum.TryParse(typeof(Domain.ENUMs.Roles), requestedRole, true, out var parsedRole))
                {
                    assignedRole = parsedRole.ToString();
                }
            }

            // Generate and send OTP to the user's email after registration
            await _otpService.GenerateAndSendOTPAsync(registerDto.Email);

            return new OtpResponseDto
            {
                Email = registerDto.Email,
                Message = "A verification code has been sent to your email address."
            };
        }

        public async Task<UserDto> VerifyOtpAndRegisterAsync(VerifyOtpDto verifyOtpDto)
        {
            // Verify the OTP using DB
            var isValid = await _otpService.VerifyOTPAsync(verifyOtpDto.Email, verifyOtpDto.Otp);
            if (!isValid)
            {
                throw new Exception("Invalid or expired OTP code.");
            }

            // Retrieve the user that was created
            var user = await _userManager.FindByEmailAsync(verifyOtpDto.Email);
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // Mark email as confirmed
            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);

            var token = _jwtService.GenerateToken(user);

            if (!await roleManager.RoleExistsAsync(assignedRole))
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                ExpireOn = DateTime.UtcNow.AddDays(7)
            };
        }

        public async Task<OtpResponseDto> ResendOtpAsync(ResendOtpDto resendOtpDto)
        {
            var user = await _userManager.FindByEmailAsync(resendOtpDto.Email);
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // Generate and send a new OTP
            await _otpService.GenerateAndSendOTPAsync(resendOtpDto.Email);

            return new OtpResponseDto
            {
                Email = resendOtpDto.Email,
                Message = "A new verification code has been sent to your email address."
            };
                await roleManager.CreateAsync(new IdentityRole<int>(assignedRole));
            }

            await userManager.AddToRoleAsync(user, assignedRole);

            var roles = await userManager.GetRolesAsync(user);

            return CreateUserDto(user, refreshToken, roles);
            
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                throw new Exception("Invalid email or password.");

            var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid)
                throw new Exception("Invalid email or password.");

            var refreshToken = refreshTokenService.GenerateToken();
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(refreshToken));
            var roles = await userManager.GetRolesAsync(user);

            var result = await userManager.UpdateAsync(user);
            HandleResult(result, "Refresh token creation failed");

            return CreateUserDto(user, refreshToken, roles);
        }

        public async Task<UserDto> RefreshTokenAsync(RefreshTokenRequestDto refreshTokenRequestDto)
        {
            var (user, oldRefreshToken) = await GetUserByRefreshTokenAsync(refreshTokenRequestDto.RefreshToken);
            oldRefreshToken.RevokedOn = DateTime.UtcNow;

            var newRefreshToken = refreshTokenService.GenerateToken();
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(newRefreshToken));

            var roles = await userManager.GetRolesAsync(user);
            var result = await userManager.UpdateAsync(user);
            HandleResult(result, "Refresh token rotation failed");

            return CreateUserDto(user, newRefreshToken, roles);
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

        private UserDto CreateUserDto(ApplicationUser user, string refreshToken, IList<string> roles)
        {
            return new UserDto
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = jwtService.GenerateToken(user, roles),
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
