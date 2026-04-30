using Domain.Entities;

namespace Application.Core.Interfaces.Auth
{
    public interface IOTPService
    {
        Task GenerateOTPAsync(ApplicationUser user);
        Task<bool> VerifyOTPAsync(ApplicationUser user, string otp);
    }
}
