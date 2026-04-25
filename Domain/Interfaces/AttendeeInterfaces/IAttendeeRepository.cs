using Domain.Entities.AttendeeEntities;
using Domain.Interfaces;

namespace Domain.Interfaces.AttendeeInterfaces
{
    public interface IAttendeeRepository : IQueryableRepository<Attendee>
    {

    }
}
