namespace Application.Core.DTOs.Booking
{
    public class VerifyAttendanceResponseDto
    {
        public int BookingId { get; set; }
        public int AttendeeId { get; set; }
        public string AttendeeName { get; set; }
        public string AttendeeEmail { get; set; }
        public string EventTitle { get; set; }
        public int NumberOfTickets { get; set; }
        public string Status { get; set; }
        public DateTime CheckedInAt { get; set; }
    }
}
