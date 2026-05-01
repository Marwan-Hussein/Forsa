using Domain.Entities;

namespace Application.Core.Interfaces.Auth.OTP
{
    public interface IOTPService
    {
        Task GenerateOTPAsync(ApplicationUser user);
        Task<bool> VerifyOTPAsync(ApplicationUser user, string otp);

        /// <summary>
        /// Generate and send an OTP to the given email address (pre-registration).
        /// </summary>
        Task GenerateAndSendOTPAsync(string email);

        /// <summary>
        /// Verify an OTP for the given email address (pre-registration).
        /// </summary>
        Task<bool> VerifyOTPAsync(string email, string otp);
    }
}

