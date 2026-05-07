using Application.Core.DTOs.Event;
using Domain.ENUMs;

namespace Application.Core.Interfaces.EventInterfaces
{
    public interface IEventAdminService
    {
        Task<List<EventDetailsDto>> GetAllAsync(EventSearchParameterDto parameters);
        Task<bool> UpdateStatusAsync(int eventId, EventStatus status);
        Task<bool> SoftDeleteAsync(int eventId);
    }
}
