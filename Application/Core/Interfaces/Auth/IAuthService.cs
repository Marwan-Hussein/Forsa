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
        /// Step 1: Validate registration data, store it in Redis, and send an OTP to the user's email.
        /// </summary>
        Task<OtpResponseDto> InitiateRegistrationAsync(RegisterDto registerDto);

        /// <summary>
        /// Step 2: Verify the OTP and, if valid, create the user account and return a JWT.
        /// </summary>
        Task<UserDto> VerifyOtpAndRegisterAsync(VerifyOtpDto verifyOtpDto);

        /// <summary>
        /// Resend OTP to the email (registration data must still be cached in Redis).
        /// </summary>
        Task<OtpResponseDto> ResendOtpAsync(ResendOtpDto resendOtpDto);
    }
}
