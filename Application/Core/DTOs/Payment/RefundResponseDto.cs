namespace Application.Core.DTOs.Payment
{
    public class RefundResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public string? RefundId { get; set; }
        public decimal Amount { get; set; }
    }
}
