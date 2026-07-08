using Application.Core.DTOs.Auth;
using Application.Core.Interfaces;
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
        IOptions<JwtSettings> jwtSettings,IOTPService otpService, IUserProfileService userProfileService) : IAuthService
    {
        private readonly JwtSettings jwtSettings = jwtSettings.Value;

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            /*var emailExist = await userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            var user = mapper.Map<ApplicationUser>(registerDto);
            user.EmailConfirmed = false;

            var result = await userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
            }
            var token = jwtService.GenerateToken(user);
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
            var emailExist = await userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

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

            // Create the user in the database with the correct derived type
            ApplicationUser user;
            if (assignedRole == "Owner")
                user = mapper.Map<Domain.Entities.OwnerEntities.Owner>(registerDto);
            else if (assignedRole == "Organizer")
                user = mapper.Map<Domain.Entities.OrganizerEntities.Organizer>(registerDto);
            else
                user = mapper.Map<Domain.Entities.AttendeeEntities.Attendee>(registerDto);

            user.UserName = registerDto.UserName is null ? registerDto.Email : registerDto.UserName;
            user.EmailConfirmed = false; // Need to verify OTP
            user.CreatedAt = DateTime.UtcNow;
            user.IsBlocked = false;
            user.IsDeleted = false;
            user.ProfilePicture = "/defaultProfilePicture.png";
            user.BirthDate = registerDto.birthdate;

            var refreshToken = refreshTokenService.GenerateToken();
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(refreshToken));

            var result = await userManager.CreateAsync(user, registerDto.Password);
            HandleResult(result, "User creation failed");

            // Create the role if it doesn't exist
            if (!await roleManager.RoleExistsAsync(assignedRole))
            {
                await roleManager.CreateAsync(new IdentityRole<int>(assignedRole));
            }

            // Add user to the role
            await userManager.AddToRoleAsync(user, assignedRole);

            // Generate and send OTP to the user's email after registration
            await otpService.GenerateAndSendOTPAsync(registerDto.Email);

            return new OtpResponseDto
            {
                Email = registerDto.Email,
                Message = "A verification code has been sent to your email address."
            };
        }

        public async Task<UserDto> VerifyOtpAndRegisterAsync(VerifyOtpDto verifyOtpDto)
        {
            // Verify the OTP using DB
            var isValid = await otpService.VerifyOTPAsync(verifyOtpDto.Email, verifyOtpDto.Otp);
            if (!isValid)
            {
                throw new Exception("Invalid or expired OTP code.");
            }

            // Retrieve the user that was created
            var user = await userManager.FindByEmailAsync(verifyOtpDto.Email);
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // Mark email as confirmed
            user.EmailConfirmed = true;
            await userManager.UpdateAsync(user);

            var token = jwtService.GenerateToken(user , await userManager.GetRolesAsync(user));

            var assignedRole = (await userManager.GetRolesAsync(user)).FirstOrDefault() ?? "Attendee";
            if (!await roleManager.RoleExistsAsync(assignedRole))
            {
                await roleManager.CreateAsync(new IdentityRole<int>(assignedRole));
            }

            await userManager.AddToRoleAsync(user, assignedRole);

            var roles = await userManager.GetRolesAsync(user);

            return CreateUserDto(user, token, roles);
        }

        public async Task<OtpResponseDto> ResendOtpAsync(ResendOtpDto resendOtpDto)
        {
            var user = await userManager.FindByEmailAsync(resendOtpDto.Email);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            if(user.EmailConfirmed)
            {
                throw new Exception("Email is already verified.");
            }

            // Generate and send a new OTP
            await otpService.GenerateAndSendOTPAsync(resendOtpDto.Email);

            return new OtpResponseDto
            {
                Email = resendOtpDto.Email,
                Message = "A new verification code has been sent to your email address."
            };
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                throw new Exception("Invalid email or password.");

            // Enforce email verification
            if (!user.EmailConfirmed)
                throw new Exception("Email is not verified.");

            var passwordValid = await userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid)
                throw new Exception("Invalid email or password.");

            // Enforce block status
            if (user.IsBlocked == true)
                throw new Exception("Your account has been blocked by an administrator.");

            var refreshToken = refreshTokenService.GenerateToken();
            if (user.RefreshTokens == null)
            {
                user.RefreshTokens = new List<Domain.Entities.AuthEntities.RefreshToken>();
            }
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
            var user = await userManager.Users
                .SingleOrDefaultAsync(u =>u.RefreshTokens
                .Any(t => t.Token == token));

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
                ExpireOn = DateTime.UtcNow.AddMinutes(jwtSettings.JWTDurationInMinutes),
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

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                throw new Exception("User with this email does not exist.");
            }

            await otpService.GenerateAndSendOTPAsync(email);
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await userManager.Users
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.Email == resetPasswordDto.Email);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var isValidOtp = await otpService.VerifyOTPAsync(resetPasswordDto.Email, resetPasswordDto.Otp);
            if (!isValidOtp)
            {
                throw new Exception("Invalid or expired OTP code.");
            }

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var result = await userManager.ResetPasswordAsync(user, token, resetPasswordDto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to reset password: {errors}");
            }

            // Revoke all active refresh tokens to force re-login on all devices
            if (user.RefreshTokens != null)
            {
                foreach (var activeToken in user.RefreshTokens.Where(t => t.IsActive))
                {
                    activeToken.RevokedOn = DateTime.UtcNow;
                }
                await userManager.UpdateAsync(user);
            }

            return true;
        }

        public async Task<UserDto> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await userManager.Users
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var result = await userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception(errors);
            }

            // Revoke all active refresh tokens to force re-login on all other devices
            if (user.RefreshTokens != null)
            {
                foreach (var activeToken in user.RefreshTokens.Where(t => t.IsActive))
                {
                    activeToken.RevokedOn = DateTime.UtcNow;
                }
            }

            // Generate new session tokens for the current browser session
            var newRefreshToken = refreshTokenService.GenerateToken();
            if (user.RefreshTokens == null)
            {
                user.RefreshTokens = new List<Domain.Entities.AuthEntities.RefreshToken>();
            }
            user.RefreshTokens.Add(refreshTokenService.CreateRefreshToken(newRefreshToken));

            var updateResult = await userManager.UpdateAsync(user);
            HandleResult(updateResult, "Failed to update user session after password change");

            var roles = await userManager.GetRolesAsync(user);
            return CreateUserDto(user, newRefreshToken, roles);
        }
    }
}
