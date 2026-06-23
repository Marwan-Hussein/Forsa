namespace Application.Core.DTOs.Booking
{
    public class VerifyAttendanceRequestDto
    {
        public int EventId { get; set; }
        public string QrCode { get; set; } = string.Empty;
    }
}
