using MailKit.Net.Smtp;
using MailKit;
using MimeKit;
using Application.Core.Interfaces.Auth.OTP;

namespace Application.Services.Auth.OTP
{
    public class EmailService : IEmailService
    {
        public async Task SendAsync(string to, string subject, string body)
        {
            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress("Forsa", "no-reply@forsa.com"));
            msg.To.Add(new MailboxAddress("",to));
            msg.Subject = subject;
            msg.Body = new TextPart("html")
            {
                Text = body
            };

            // to connect to the SMTP server and send the email
            using var client = new SmtpClient();
            await client.ConnectAsync("smtp.forsa.com", 587, false);
            await client.AuthenticateAsync("no-reply@forsa.com", "yourpassword");
            await client.SendAsync(msg);
            await client.DisconnectAsync(true);
        }
    }
}
