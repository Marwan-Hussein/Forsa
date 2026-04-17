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

        // Relationships
        public WishListItem WishList { get; set; }

        // public AttendeeInterest AttendeeInterest { get; set; } // to be removed
        public List<AttendeeInterest> AttendeeInterests { get; set; }
    }
}
