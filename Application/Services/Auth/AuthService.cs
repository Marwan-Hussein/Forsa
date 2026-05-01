using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using Application.Core.Interfaces.Auth.OTP;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Application.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtService _jwtService;
        private readonly IOTPService _otpService;

        public AuthService(
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            IJwtService jwtService,
            IOTPService otpService)
        {
            _mapper = mapper;
            _userManager = userManager;
            _jwtService = jwtService;
            _otpService = otpService;
        }

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
            var user = _mapper.Map<ApplicationUser>(registerDto);
            user.EmailConfirmed = false; // Need to verify OTP
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
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

            return new UserDto
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
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                throw new Exception("Invalid email or password.");

            var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid)
                throw new Exception("Invalid email or password.");

            if (!user.EmailConfirmed)
                throw new Exception("Please verify your email before logging in.");

            var token = _jwtService.GenerateToken(user);
            return new UserDto
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                ExpireOn = DateTime.UtcNow.AddDays(7)
            };
        }
    }
}
