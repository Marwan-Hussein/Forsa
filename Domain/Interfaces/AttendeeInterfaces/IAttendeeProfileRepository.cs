using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities.AttendeeEntities;


namespace Domain.Interfaces.AttendeeInterfaces
{
    public interface IAttendeeProfileRepository
    {
        Attendee? GetAttendeeWithInterests(int attendeeId);
        List<int> GetValidInterestIds(List<int> requestedIds);
        void UpdateAttendeeInterests(Attendee attendee, List<int> validInterestIds);
        void SaveChanges();
        List<AttendeeInterest> GetAllInterests();
    }
}
