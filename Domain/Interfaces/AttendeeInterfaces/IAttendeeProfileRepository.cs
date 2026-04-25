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
        Task<Attendee?> GetAttendeeWithInterestsAsync(int attendeeId);
        Task<List<int>> GetValidInterestIdsAsync(List<int> requestedIds);
        void UpdateAttendeeInterests(Attendee attendee, List<int> validInterestIds);
        Task<List<AttendeeInterest>> GetAllInterestsAsync();
    }
}
