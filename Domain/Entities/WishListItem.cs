using Domain.Entities.AttendeeEntities;
using Domain.Entities.EventEntities;

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
