using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class WishListItem
    {
        public int WishListItemId { get; set; }





        // One to One with Attendee
        public int AttendeeId { get; set; }
        public Attendee Attendee { get; set; }

        // Many to many with Events
        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}
