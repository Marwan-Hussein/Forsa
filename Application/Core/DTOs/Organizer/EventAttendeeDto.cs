using System;

namespace Application.Core.DTOs.Organizer
{
    public class EventAttendeeDto
    {
        public int BookingId { get; set; }
        public int AttendeeId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public int NumberOfTickets { get; set; }
        public string TicketType { get; set; } // e.g. "General", "VIP" based on logic or static for now
        public DateTime BookingDate { get; set; }
        public string CheckInStatus { get; set; } // e.g. "checked-in", "not-checked-in"
        public string CheckInTime { get; set; } // Nullable, string representation
        public string PaymentStatus { get; set; } // e.g. "paid", "pending"
    }
}
