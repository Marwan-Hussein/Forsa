using Application.Core.DTOs.Event;
using Application.Core.Interfaces.EventInterfaces;
using Application.Core.Interfaces;
using Application.Core.DTOs.CommonDTOs;
using Domain.Entities;
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
        private readonly IGenericRepository<Notification> _notificationRepository;
        private readonly INotifierService _notifierService;

        public EventAdminService(
            IEventService eventService,
            IEventRepository repo,
            IUnitOfWork unitOfWork,
            IGenericRepository<Notification> notificationRepository,
            INotifierService notifierService)
        {
            _eventService = eventService;
            _repo = repo;
            _unitOfWork = unitOfWork;
            _notificationRepository = notificationRepository;
            _notifierService = notifierService;
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
            #region notification
            var notification = new Notification
            {
                Message = $"Your event '{ev.Title}' status has been updated to {status}.",
                Type = NotificationType.EventUpdate,
                SentVia = DeliveryMethod.Email,
                Status = NotificationStatus.Pending,
                UserId = ev.OrganizerId,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);

            await _unitOfWork.SaveChangesAsync();

            try
            {
                await _notifierService.SendAsync(ev.OrganizerId, new NotificationMessageDto
                {
                    Title = "Event Status Updated",
                    Body = $"Your event '{ev.Title}' status has been updated to {status}.",
                    Type = NotificationType.EventUpdate.ToString()
                });
            }
            catch
            {
                // Silence real-time notification failures to prevent blocking execution
            }
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

            var notification = new Notification
            {
                Message = $"Your event '{ev.Title}' has been deleted by an administrator.",
                Type = NotificationType.EventUpdate,
                SentVia = DeliveryMethod.Email,
                Status = NotificationStatus.Pending,
                UserId = ev.OrganizerId,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);

            await _unitOfWork.SaveChangesAsync();

            try
            {
                await _notifierService.SendAsync(ev.OrganizerId, new NotificationMessageDto
                {
                    Title = "Event Deleted",
                    Body = $"Your event '{ev.Title}' has been deleted by an administrator.",
                    Type = NotificationType.EventUpdate.ToString()
                });
            }
            catch
            {
                // Silence real-time notification failures to prevent blocking execution
            }

            return true;
        }
    }
}
