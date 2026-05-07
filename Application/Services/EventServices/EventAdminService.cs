using Application.Core.DTOs.Event;
using Application.Core.Interfaces.EventInterfaces;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.EventServices
{
    public class EventAdminService : IEventAdminService
    {
        private readonly IEventService _eventService;
        private readonly IEventRepository _repo;
        private readonly IUnitOfWork _unitOfWork;

        public EventAdminService(
            IEventService eventService,
            IEventRepository repo,
            IUnitOfWork unitOfWork)
        {
            _eventService = eventService;
            _repo = repo;
            _unitOfWork = unitOfWork;
        }

        public Task<List<EventDetailsDto>> GetAllAsync(EventSearchParameterDto parameters)
        {
            return _eventService.FilterEventsByParameters(parameters);
        }

        public async Task<bool> UpdateStatusAsync(int eventId, EventStatus status)
        {
            var ev = await _repo.GetQueryable()
                                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);
            if (ev == null)
                return false;

            ev.Status = status;
            ev.LastModifiedAt = DateTime.UtcNow;

            _repo.Update(ev);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> SoftDeleteAsync(int eventId)
        {
            var ev = await _repo.GetQueryable()
                                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);
            if (ev == null)
                return false;

            ev.IsDeleted = true;
            ev.DeletedAt = DateTime.UtcNow;

            _repo.Update(ev);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
