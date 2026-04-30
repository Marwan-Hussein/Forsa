namespace Application.Core.Interfaces.Auth
{
    internal interface IEmailService
    {
        Task SendAsync(string to, string subject, string body);
    }
}
