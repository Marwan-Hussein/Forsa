namespace Application.Core.Interfaces.Auth
{
    public interface IOTPService
    {
        public string GenerateOTP();
        public bool VerifyOTP(string otp);
    }
}
