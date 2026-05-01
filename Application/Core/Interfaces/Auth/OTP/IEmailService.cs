namespace Application.Core.Interfaces.Auth.OTP
{
    public interface IEmailService
    {
        Task SendAsync(string to, string subject, string body);
    }
}
