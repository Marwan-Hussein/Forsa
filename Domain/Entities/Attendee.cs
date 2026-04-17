using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Attendee
    {
        public int AttendeeId { get; set; }

        public int LoyaltyPoint { get; set; } 

        



        public int UserId { get; set;  }
        public User User { get; set; }





 
        public AttendeeInterest AttendeeInterest { get; set; }
        public List<AttendeeInterest> AttendeeInterests { get; set; }

        // One to one relationship
        public WishListItem WishListItem { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    }
}
