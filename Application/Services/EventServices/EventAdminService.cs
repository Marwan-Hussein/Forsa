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
using Application.Core.Helpers;

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
            var title = "Event Status Updated 📢";
            var bodyText = $"Hello Organizer!\n\nWe wanted to update you on your event submission, **{ev.Title}**. The administrative team has reviewed and updated its status to **{status}**. 📋\n\nYou can view the full details and manage the event by logging into your organizer dashboard.";
            
            var details = new Dictionary<string, string>
            {
                { "Event Title", ev.Title },
                { "New Status", status.ToString() },
                { "Date Updated", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm UTC") }
            };

            var htmlBody = EmailTemplateHelper.BuildHtmlTemplate(title, bodyText, details);
            var organizerEmail = ev.Organizer?.Email;
            if (organizerEmail is not null)
            {
                try
                {
                    await _emailService.SendAsync(organizerEmail,
                        $"'{ev.Title}' Status Updated",
                        htmlBody);
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
                    .Include(s => s.Attendee)
                    .Where(s => s.OrganizerId == ev.OrganizerId)
                    .ToListAsync();

                var subTitle = "New Event Published! ✨";
                var subBody = $"Exciting news! **{organizerName}**, an organizer you follow, has just published a brand new event: **{ev.Title}**! 🚀\n\nBe among the first to check it out, view the details, and book your tickets before they sell out. We hope to see you there!";
                
                var subDetails = new Dictionary<string, string>
                {
                    { "Event Title", ev.Title },
                    { "Organized By", organizerName },
                    { "Platform", "Forsa" }
                };

                var subHtmlBody = EmailTemplateHelper.BuildHtmlTemplate(subTitle, subBody, subDetails);
                foreach (var sub in subscribers)
                {
                    if (!string.IsNullOrWhiteSpace(sub.Attendee?.Email))
                    {
                        try
                        {
                            await _emailService.SendAsync(sub.Attendee.Email, $"'{ev.Title}' Published", subHtmlBody);
                        }
                        catch
                        {
                            // Silence email failures so the status update still succeeds
                        }
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
                                .Include(e => e.Organizer)
                                .FirstOrDefaultAsync(e => e.Id == eventId && !e.IsDeleted);
            if (ev == null)
                return false;

            ev.IsDeleted = true;
            ev.DeletedAt = DateTime.UtcNow;

            _repo.Update(ev);

            await _unitOfWork.SaveChangesAsync();

            var title = "Event Listing Removed 🚨";
            var bodyText = $"Hello Organizer.\n\nWe are writing to notify you that your event listing, **{ev.Title}**, has been removed from Forsa by an administrator. 🛑\n\nIf you have any questions or believe this deletion was in error, please contact support for clarification.";
            
            var details = new Dictionary<string, string>
            {
                { "Event Title", ev.Title },
                { "Action Taken", "Removed by Administrator" },
                { "Date Removed", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm UTC") }
            };

            var htmlBody = EmailTemplateHelper.BuildHtmlTemplate(title, bodyText, details);
            if (ev.Organizer?.Email is not null)
            {
                try
                {
                    await _emailService.SendAsync(ev.Organizer.Email,
                        "Event Deleted",
                        htmlBody);
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
