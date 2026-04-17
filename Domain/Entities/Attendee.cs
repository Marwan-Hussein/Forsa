using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Attendee : ApplicationUser
    {
        public int LoyaltyPoint { get; set; }

        



        public int UserId { get; set;  }
        public User User { get; set; }





        public WishListItem WishList { get; set; }

        public AttendeeInterest AttendeeInterest { get; set; }
        public List<AttendeeInterest> AttendeeInterests { get; set; }

        public ICollection<Booking> Bookings { get; set; };
        public ICollection<Feedback> Feedbacks { get; set; };
    }
}
