namespace Application.Core.Interfaces.Auth.OTP
{
    internal interface IEmailService
    {
        Task SendAsync(string to, string subject, string body);
    }
}
