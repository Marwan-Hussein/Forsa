namespace Application.Core.DTOs.Booking
{
    public class CreateBookingRequestDto
    {
        public int AttendeeId { get; set; }
        public int EventId { get; set; }
        public int NumberOfTickets { get; set; }  // to validate 
    }
}
