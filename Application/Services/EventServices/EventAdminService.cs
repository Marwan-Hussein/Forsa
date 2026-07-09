using Application.Core.DTOs.Event;
using Application.Core.Interfaces.EventInterfaces;
using Application.Core.Interfaces;
using Application.Core.Interfaces.Auth.OTP;
using Application.Core.DTOs.CommonDTOs;
using Domain.Entities;
using Domain.Entities.AttendeeEntities;
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
        private readonly IQueryableRepository<AttendeeSubsOrganizer> _subRepository;
        private readonly IEmailService _emailService;

        public EventAdminService(
            IEventService eventService,
            IEventRepository repo,
            IUnitOfWork unitOfWork,
            IQueryableRepository<AttendeeSubsOrganizer> subRepository,
            IEmailService emailService)
        {
            _eventService = eventService;
            _repo = repo;
            _unitOfWork = unitOfWork;
            _subRepository = subRepository;
            _emailService = emailService;
        }

        public Task<List<EventDetailsDto>> GetAllAsync(EventSearchParameterDto parameters)
        {
            return _eventService.FilterEventsByParameters(parameters);
        }

        public async Task<bool> UpdateStatusAsync(int eventId, EventStatus status)
        {
            var ev = await _repo.GetQueryable()
                                .Include(e => e.Organizer)
                                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);
            if (ev == null)
                return false;

            ev.Status = status;
            ev.LastModifiedAt = DateTime.UtcNow;

            _repo.Update(ev);
            #region Email to organization
            var message = $"Your event '{ev.Title}' status has been updated to {status}.";
            var organizerEmail = ev.Organizer?.Email;
            if (organizerEmail is not null)
            {
                try
                {
                    await _emailService.SendAsync(organizerEmail,
                        @"'{ev.Title}' Status Updated",
                        message);
                }
                catch
                {
                    // Silence email failures so the status update still succeeds
                }
            }

            // Notify subscribers if published
            if (status == EventStatus.Published)
            {
                var organizerName = ev.Organizer?.FullName ?? "An organizer you follow";
                var subscribers = await _subRepository.GetQueryable()
                    .Where(s => s.OrganizerId == ev.OrganizerId)
                    .ToListAsync();

                var message2 = $"Organizer '{organizerName}' has published a new event: '{ev.Title}'!";
                foreach (var sub in subscribers)
                {
                    try
                    {
                        await _emailService.SendAsync(sub.Attendee?.Email, @"'{ev.Title}' Published", message2);
                    }
                    catch
                    {
                        // Silence email failures so the status update still succeeds
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();
            #endregion
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

            var message = $"Your event '{ev.Title}' has been deleted by an administrator.";
            if (ev.Organizer?.Email is not null)
            {
                try
                {
                    await _emailService.SendAsync(ev.Organizer.Email,
                        "Event Deleted",
                        message);
                }
                catch
                {
                    // Silence email failures so the delete still succeeds
                }
            }
            return true;
        }
    }
}
