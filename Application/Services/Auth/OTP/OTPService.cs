using Application.Core.Interfaces.Auth.OTP;
using Domain.Entities;
using Domain.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services.Auth.OTP
{
    public class OTPService : IOTPService
    {
        private readonly IQueryableRepository<UserOtp> _otpRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _email;

        private string HashOtp(string otp)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(otp);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public OTPService(IQueryableRepository<UserOtp> otpRepository, IUnitOfWork unitOfWork, IEmailService email)
        {
            _otpRepository = otpRepository;
            _unitOfWork = unitOfWork;
            _email = email;
        }

        public async Task GenerateAndSendOTPAsync(string email)
        {
            var otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            var otpHash = HashOtp(otp);

            var existingOtps = _otpRepository.GetQueryable().Where(o => o.Email == email).ToList();
            foreach (var existing in existingOtps)
            {
                await _otpRepository.DeleteAsync(existing.Id);
            }

            var userOtp = new UserOtp
            {
                Email = email,
                OtpHash = otpHash,
                ExpiryTime = DateTime.Now.AddMinutes(5)
            };

            await _otpRepository.AddAsync(userOtp);
            await _unitOfWork.SaveChangesAsync();

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
            var userOtp = _otpRepository.GetQueryable()
                .Where(o => o.Email == email)
                .OrderByDescending(o => o.ExpiryTime)
                .FirstOrDefault();

            if (userOtp == null)
                return false; 

            if (userOtp.ExpiryTime < DateTime.Now)
            {
                await _otpRepository.DeleteAsync(userOtp.Id);
                await _unitOfWork.SaveChangesAsync();
                return false; 
            }

            var correctOtpHash = HashOtp(otp);
            if (userOtp.OtpHash != correctOtpHash)
                return false; 

            await _otpRepository.DeleteAsync(userOtp.Id);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerifyOTPAsync(ApplicationUser user, string otp)
        {
            return await VerifyOTPAsync(user.Email!, otp);
        }
    }
}