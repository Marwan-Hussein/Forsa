namespace Application.Core.Settings
{
    public class GoogleAuthSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }

        // Bind directly from GoogleId and GoogleSecret in appsettings.json if present
        public string GoogleId { get; set; }
        public string GoogleSecret { get; set; }

        public string ResolvedClientId => !string.IsNullOrEmpty(ClientId) ? ClientId : GoogleId;
        public string ResolvedClientSecret => !string.IsNullOrEmpty(ClientSecret) ? ClientSecret : GoogleSecret;
    }
}
