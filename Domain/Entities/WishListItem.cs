using Domain.Entities.AttendeeEntities;
using Domain.Entities.EventEntities;
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

        public int AttendeeId { get; set; }
        public Attendee Attendee { get; set; }

        public ICollection<Event> Events { get; set; }
    }
}
