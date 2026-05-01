using Application.Core.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.Auth
{
    public interface IAuthService
    {
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto> LoginAsync(LoginDto loginDto);

        /// <summary>
        /// Step 1: Validate registration data, create user in DB, and send an OTP to the user's email.
        /// </summary>
        Task<OtpResponseDto> InitiateRegistrationAsync(RegisterDto registerDto);

        /// <summary>
        /// Step 2: Verify the OTP and, if valid, return a JWT.
        /// </summary>
        Task<UserDto> VerifyOtpAndRegisterAsync(VerifyOtpDto verifyOtpDto);

        /// <summary>
        /// Resend OTP to the email.
        /// </summary>
        Task<OtpResponseDto> ResendOtpAsync(ResendOtpDto resendOtpDto);
        Task<UserDto> RefreshTokenAsync(RefreshTokenRequestDto refreshTokenRequestDto);
        Task RevokeRefreshTokenAsync(RefreshTokenRequestDto refreshTokenRequestDto);
    }
}
