namespace Application.Core.DTOs.Payment
{
    public class PayoutResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public string? PayoutId { get; set; }
        public decimal Amount { get; set; }
    }
}
