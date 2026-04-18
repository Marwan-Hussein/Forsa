using Domain.Entities.BookingEntities;

namespace Domain.Entities.AttendeeEntities
{
    public class Attendee : ApplicationUser
    {
        public int LoyaltyPoint { get; set; }

        public WishListItem WishList { get; set; }

        //public AttendeeInterest AttendeeInterest { get; set; }
        //public List<AttendeeInterest> AttendeeInterests { get; set; }

        public List<Booking> Bookings { get; set; }
        public List<Feedback> Feedbacks { get; set; }


        // Navigation properties
        public List<AttendeeSubsOrganizer> AttendeeSubsOrganizers { get; set; }
        public List<AttendeeInterestesWithAttendee> AttendeeInterestesWithAttendee { get; set; }
    }
}
