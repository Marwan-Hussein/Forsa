using Application.Core.Interfaces.Auth.OTP;
using Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services.Auth.OTP
{
    public class OTPService : IOTPService
    {
        private readonly IRedisCacheService _redis;
        private readonly IEmailService _email;

        private string HashOtp(string otp)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(otp);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public OTPService(IRedisCacheService redis, IEmailService email)
        {
            _redis = redis;
            _email = email;
        }

        public async Task GenerateAndSendOTPAsync(string email)
        {
            // Generate a cryptographically secure 6-digit OTP
            var otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            var otpHash = HashOtp(otp);

            // store in Redis (5 min expiry) – keyed by email since the user doesn't exist yet
            await _redis.SetAsync($"otp:{email}", otpHash, TimeSpan.FromMinutes(5));

            // Build a professional HTML email body
            var htmlBody = $@"
                <div style='font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;'>
                    <div style='text-align: center; margin-bottom: 24px;'>
                        <h1 style='color: #1a1a2e; font-size: 24px; margin: 0;'>Forsa</h1>
                        <p style='color: #6b7280; font-size: 14px; margin-top: 4px;'>Email Verification</p>
                    </div>
                    <div style='background: white; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;'>
                        <p style='color: #374151; font-size: 16px; margin: 0 0 16px 0;'>Your verification code is:</p>
                        <div style='text-align: center; margin: 24px 0;'>
                            <span style='font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; background: #f3f4f6; padding: 12px 24px; border-radius: 12px; display: inline-block;'>{otp}</span>
                        </div>
                        <p style='color: #6b7280; font-size: 14px; margin: 16px 0 0 0;'>This code will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
                    </div>
                    <p style='color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;'>If you didn't request this code, please ignore this email.</p>
                </div>";

            await _email.SendAsync(email, "Your Forsa Verification Code", htmlBody);
        }

        public async Task GenerateOTPAsync(ApplicationUser user)
        {
            await GenerateAndSendOTPAsync(user.Email!);
        }

        public async Task<bool> VerifyOTPAsync(string email, string otp)
        {
            var key = $"otp:{email}";

            var storedHashedOtp = await _redis.GetAsync<string>(key);
            if (storedHashedOtp == null)
                return false; // expired or not generated

            var correctOtpHash = HashOtp(otp);
            if (storedHashedOtp != correctOtpHash)
                return false; // incorrect OTP

            await _redis.RemoveAsync(key); // OTP can only be used once
            return true;
        }

        public async Task<bool> VerifyOTPAsync(ApplicationUser user, string otp)
        {
            return await VerifyOTPAsync(user.Email!, otp);
        }
    }
}