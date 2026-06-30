namespace Application.Core.DTOs.ExternalDTOs
{
    public class GoogleAuthTokenDto
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string? IdToken { get; set; }
        public string? TokenType { get; set; }
        public int ExpiresInSeconds { get; set; }
        public DateTime IssuedUtc { get; set; }
        public DateTime ExpiresAtUtc { get; set; }
    }
}
