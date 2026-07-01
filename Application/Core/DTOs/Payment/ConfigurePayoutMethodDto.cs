using Domain.ENUMs;

namespace Application.Core.DTOs.Payment
{
    public class ConfigurePayoutMethodDto
    {
        public PayoutType Type { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
    }
}
