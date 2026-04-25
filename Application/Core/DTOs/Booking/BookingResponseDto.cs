namespace Application.Core.DTOs.Booking
{
    public class BookingResponseDto
    {
        public int BookingId { get; set; }
        public int AttendeeId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public int NumberOfTickets { get; set; }
        public DateTime BookingDate { get; set; }
        public string Status { get; set; }   // Enum BookingStatus
        public string QRCode { get; set; }
    }
}
