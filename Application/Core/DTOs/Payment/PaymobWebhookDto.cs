using System.Text.Json.Serialization;

namespace Application.Core.DTOs.Payment
{
    public class PaymobWebhookDto
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("obj")]
        public PaymobWebhookObjDto Obj { get; set; }
    }

    public class PaymobWebhookObjDto
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("pending")]
        public bool Pending { get; set; }

        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("amount_cents")]
        public decimal AmountCents { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; }

        [JsonPropertyName("intention_id")]
        public string IntentionId { get; set; }
    }
}
