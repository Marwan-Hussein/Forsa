using Application.Core.DTOs.Organizer;
using Domain.Entities.OwnerEntities;

namespace Application.Core.Interfaces.OwnerInterfaces
{
    public interface IOwnerService
    {
        Task<List<Owner>> FilterOwners(OrganizerSearchParameters searchParameter);
    }
}
