namespace Application.Core.DTOs.Booking
{
    public class ProcessBookingRequestDto
    {
        public bool AcceptRequest { get; set; }
        public string? RejectionReason { get; set; }  // required when AcceptRequest = false
    }
}
