using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using Application.Core.Interfaces.Auth.OTP;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtService _jwtService;
        private readonly IOTPService _otpService;
        private readonly IRedisCacheService _redis;

        public AuthService(
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            IJwtService jwtService,
            IOTPService otpService,
            IRedisCacheService redis)
        {
            _mapper = mapper;
            _userManager = userManager;
            _jwtService = jwtService;
            _otpService = otpService;
            _redis = redis;
        }

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            var emailExist = await _userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            var user = _mapper.Map<ApplicationUser>(registerDto);

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
            }
            var token = _jwtService.GenerateToken(user);

            return new UserDto
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                ExpireOn = DateTime.UtcNow.AddDays(7)   
            };
        }

        /// <summary>
        /// Step 1: Validate the registration data, store it in Redis, and send an OTP.
        /// The user account is NOT created at this point.
        /// </summary>
        public async Task<OtpResponseDto> InitiateRegistrationAsync(RegisterDto registerDto)
        {
            // Check if email is already taken
            var emailExist = await _userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            // Store the registration data in Redis (10 min expiry) so we can retrieve it after OTP verification
            await _redis.SetAsync($"reg:{registerDto.Email}", registerDto, TimeSpan.FromMinutes(10));

            // Generate and send OTP to the user's email
            await _otpService.GenerateAndSendOTPAsync(registerDto.Email);

            return new OtpResponseDto
            {
                Email = registerDto.Email,
                Message = "A verification code has been sent to your email address."
            };
        }

        /// <summary>
        /// Step 2: Verify the OTP. If valid, retrieve the cached registration data, 
        /// create the user, and return a JWT token.
        /// </summary>
        public async Task<UserDto> VerifyOtpAndRegisterAsync(VerifyOtpDto verifyOtpDto)
        {
            // Verify the OTP
            var isValid = await _otpService.VerifyOTPAsync(verifyOtpDto.Email, verifyOtpDto.Otp);
            if (!isValid)
            {
                throw new Exception("Invalid or expired OTP code.");
            }

            // Retrieve the cached registration data
            var registerDto = await _redis.GetAsync<RegisterDto>($"reg:{verifyOtpDto.Email}");
            if (registerDto == null)
            {
                throw new Exception("Registration session expired. Please register again.");
            }

            // Clean up Redis
            await _redis.RemoveAsync($"reg:{verifyOtpDto.Email}");

            // Double-check email hasn't been taken in the meantime
            var emailExist = await _userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            // Create the user
            var user = _mapper.Map<ApplicationUser>(registerDto);
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
            }

            var token = _jwtService.GenerateToken(user);

            return new UserDto
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                ExpireOn = DateTime.UtcNow.AddDays(7)
            };
        }

        /// <summary>
        /// Resend OTP: checks that the registration session still exists and generates a new OTP.
        /// </summary>
        public async Task<OtpResponseDto> ResendOtpAsync(ResendOtpDto resendOtpDto)
        {
            // Check that the registration data is still cached
            var registerDto = await _redis.GetAsync<RegisterDto>($"reg:{resendOtpDto.Email}");
            if (registerDto == null)
            {
                throw new Exception("Registration session expired. Please register again.");
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

