using Application.Core.Interfaces.Auth.OTP;
using Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services.Auth.OTP
{
    internal class OTPService : IOTPService
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

        public async Task GenerateOTPAsync(ApplicationUser user)
        {
            var otp = new Random().Next(10000, 99999).ToString();
            var otpHash = HashOtp(otp);

            // store in Redis (5 min expiry)
            await _redis.SetAsync($"otp:{user.Id}", otpHash, TimeSpan.FromMinutes(5));

            // send email
            await _email.SendAsync(user.Email, "Your OTP Code", $"Your OTP code is: {otp}");
        }

        public async Task<bool> VerifyOTPAsync(ApplicationUser user, string otp)
        {
            /*
             * 1. Get the hashed OTP from Redis @param user.Id
             * 2. check if there is OTP
             * 3. compare the provided with the parameter
             * 4. remove the OTP from cache (Redis)
             */
            var key = $"otp:{user.Id}";

            var storedHashedOtp = await _redis.GetAsync<string>(key);
            if (storedHashedOtp == null)
                return false; // expired or not generated

            var correctOtpHash = HashOtp(otp);
            if (storedHashedOtp != correctOtpHash)
                return false; // incorrect OTP
            
            await _redis.RemoveAsync(key); // OTP can only be used once
            return true;
        }
    }
}