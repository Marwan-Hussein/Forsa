using Application.Core.DTOs.Admin;
using Application.Core.DTOs.Place;
using Application.Core.Interfaces.PlaceInterfaces;
using Application.Core.Interfaces;
using Application.Core.Interfaces.Auth.OTP;
using Application.Core.DTOs.CommonDTOs;
using AutoMapper;
using Domain.Entities;
using Domain.ENUMs;
using Domain.Entities.PlaceEntities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.PlaceServices
{
    public class PlaceAdminService : IPlaceAdminService
    {
        private readonly IPlaceRepository _placeRepo;
        private readonly IQueryableRepository<PlaceAvailability> _availabilityRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<Notification> _notificationRepository;
        private readonly INotifierService _notifierService;
        private readonly IEmailService _emailService;

        public PlaceAdminService(
            IPlaceRepository placeRepo,
            IQueryableRepository<PlaceAvailability> availabilityRepo,
            IFeedbackRepository feedbackRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IGenericRepository<Notification> notificationRepository,
            INotifierService notifierService,
            IEmailService emailService)
        {
            _placeRepo = placeRepo;
            _availabilityRepo = availabilityRepo;
            _feedbackRepo = feedbackRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _notificationRepository = notificationRepository;
            _notifierService = notifierService;
            _emailService = emailService;
        }

        // GET /api/admin/places
        public async Task<List<PlaceDetailsDto>> GetAllPlacesAsync(PlaceSearchParameterDto parameters)
        {
            parameters ??= new PlaceSearchParameterDto();

            // Include all places except those that are soft deleted
            var query = _placeRepo.GetQueryable()
                                  .Include(p => p.PlaceMedias)
                                  .Where(p => !p.IsDeleted);

            if (!string.IsNullOrWhiteSpace(parameters.Name))
                query = query.Where(p => p.Name.Contains(parameters.Name));

            if (!string.IsNullOrWhiteSpace(parameters.Location))
                query = query.Where(p => p.Location.Contains(parameters.Location));

            query = parameters.SortBy?.ToLower() switch
            {
                "name" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.Name)
                              : query.OrderBy(p => p.Name),
                "location" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.Location)
                              : query.OrderBy(p => p.Location),
                "date" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.CreatedAt)
                              : query.OrderBy(p => p.CreatedAt),
                _ => query.OrderBy(p => p.Id)
            };

            var places = await query.ToListAsync();
            return _mapper.Map<List<PlaceDetailsDto>>(places);
        }

        // GET /api/admin/places/pending
        public async Task<List<PlaceDetailsDto>> GetPendingPlacesAsync(PlaceSearchParameterDto parameters)
        {
            parameters ??= new PlaceSearchParameterDto();

            var query = _placeRepo.GetQueryable()
                                  .Include(p => p.PlaceMedias)
                                  .Where(p => !p.IsDeleted && p.Status == PlaceStatus.Pending);

            if (!string.IsNullOrWhiteSpace(parameters.Name))
                query = query.Where(p => p.Name.Contains(parameters.Name));

            if (!string.IsNullOrWhiteSpace(parameters.Location))
                query = query.Where(p => p.Location.Contains(parameters.Location));

            query = parameters.SortBy?.ToLower() switch
            {
                "name" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.Name)
                              : query.OrderBy(p => p.Name),
                "location" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.Location)
                              : query.OrderBy(p => p.Location),
                "date" => parameters.IsDescending
                              ? query.OrderByDescending(p => p.CreatedAt)
                              : query.OrderBy(p => p.CreatedAt),
                _ => query.OrderBy(p => p.Id)
            };

            var places = await query.ToListAsync();
            return _mapper.Map<List<PlaceDetailsDto>>(places);
        }

        // PATCH /api/admin/places/{id}/status
        public async Task<bool> UpdateStatusAsync(int placeId, PlaceStatus status, string? reason)
        {
            var place = await _placeRepo.GetQueryable()
                                        .Include(p => p.Owner)
                                        .FirstOrDefaultAsync(p => p.Id == placeId && !p.IsDeleted);
            if (place == null)
                return false;

            // Business rule: a rejection must always carry a reason
            if (status == PlaceStatus.Rejected && string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("A reason must be provided when rejecting a place.");

            place.Status = status;
            place.Reason = reason;
            place.LastModifiedAt = DateTime.UtcNow;

            _placeRepo.Update(place);

            if (place.OwnerId.HasValue)
            {
                #region notification
                var msg = $"Your place '{place.Name}' status has been updated to {status}.";
                if (status == PlaceStatus.Rejected && !string.IsNullOrWhiteSpace(reason))
                {
                    msg += $" Reason: {reason}";
                }

                var notification = new Notification
                {
                    Message = msg,
                    Type = NotificationType.GeneralAlert,
                    SentVia = DeliveryMethod.Email,
                    Status = NotificationStatus.Pending,
                    UserId = place.OwnerId.Value,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepository.AddAsync(notification);

                if (!string.IsNullOrWhiteSpace(place.Owner?.Email))
                {
                    try
                    {
                        await _emailService.SendAsync(place.Owner.Email,
                            "Place Status Updated",
                            msg);
                    }
                    catch
                    {
                        // Silence email failures so status update still succeeds
                    }
                }
                #endregion
            }

            await _unitOfWork.SaveChangesAsync();

            if (place.OwnerId.HasValue)
            {
                try
                {
                    var msg = $"Your place '{place.Name}' status has been updated to {status}.";
                    if (status == PlaceStatus.Rejected && !string.IsNullOrWhiteSpace(reason))
                    {
                        msg += $" Reason: {reason}";
                    }

                    await _notifierService.SendAsync(place.OwnerId.Value, new NotificationMessageDto
                    {
                        Title = "Place Status Updated",
                        Body = msg,
                        Type = NotificationType.GeneralAlert.ToString()
                    });
                }
                catch
                {
                    // Silence real-time notification failures to prevent blocking execution
                }
            }

            return true;
        }

        // DELETE /api/admin/places/{id}
        public async Task<bool> SoftDeletePlaceAsync(int placeId)
        {
            var place = await _placeRepo.GetQueryable()
                                        .Include(p => p.Owner)
                                        .FirstOrDefaultAsync(p => p.Id == placeId && !p.IsDeleted);
            if (place == null)
                return false;

            var availabilities = await _availabilityRepo.GetQueryable()
                .Where(a => a.PlaceId == placeId && !a.IsDeleted)
                .ToListAsync();

            foreach (var availability in availabilities)
            {
                availability.IsDeleted = true;
                availability.DeletedAt = DateTime.UtcNow;
                _availabilityRepo.Update(availability);
            }

            place.IsDeleted = true;
            place.DeletedAt = DateTime.UtcNow;

            _placeRepo.Update(place);

            if (place.OwnerId.HasValue)
            {
                var notification = new Notification
                {
                    Message = $"Your place '{place.Name}' has been deleted by an administrator.",
                    Type = NotificationType.GeneralAlert,
                    SentVia = DeliveryMethod.Email,
                    Status = NotificationStatus.Pending,
                    UserId = place.OwnerId.Value,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepository.AddAsync(notification);

                if (!string.IsNullOrWhiteSpace(place.Owner?.Email))
                {
                    try
                    {
                        await _emailService.SendAsync(place.Owner.Email,
                            "Place Deleted",
                            notification.Message);
                    }
                    catch
                    {
                        // Silence email failures so delete still succeeds
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();

            if (place.OwnerId.HasValue)
            {
                try
                {
                    await _notifierService.SendAsync(place.OwnerId.Value, new NotificationMessageDto
                    {
                        Title = "Place Deleted",
                        Body = $"Your place '{place.Name}' has been deleted by an administrator.",
                        Type = NotificationType.GeneralAlert.ToString()
                    });
                }
                catch
                {
                    // Silence real-time notification failures to prevent blocking execution
                }
            }

            return true;
        }

        // GET /api/admin/reviews
        public async Task<List<AdminReviewDto>> GetAllFeedbacksAsync(string? targetType = null)
        {
            var query = _feedbackRepo.GetQueryable()
                                     .Include(f => f.Attendee)
                                     .Include(f => f.Owner)
                                     .Include(f => f.Organizer)
                                     .Include(f => f.Event)
                                     .Include(f => f.Place);

            var feedbacks = await query.ToListAsync();

            var dtos = feedbacks.Select(f => new AdminReviewDto
            {
                Id = f.Id,
                Rating = f.Rating,
                Comment = f.Comment,
                CreatedAt = f.CreatedAt,
                IsDeleted = f.IsDeleted,
                ReviewerName = f.Attendee != null ? f.Attendee.FullName :
                               f.Organizer != null ? f.Organizer.FullName :
                               f.Owner != null ? f.Owner.FullName : "Unknown",
                ReviewerType = f.Attendee != null ? "Attendee" :
                               f.Organizer != null ? "Organizer" :
                               f.Owner != null ? "Owner" : "Unknown",
                TargetName = f.Event != null ? f.Event.Title :
                             f.Place != null ? f.Place.Name : "Unknown",
                TargetType = f.Event != null ? "Event" :
                             f.Place != null ? "Place" : "Unknown"
            }).ToList();

            if (!string.IsNullOrWhiteSpace(targetType))
            {
                dtos = dtos.Where(d => d.TargetType.Equals(targetType, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return dtos.OrderByDescending(d => d.CreatedAt).ToList();
        }

        // DELETE /api/admin/reviews/{id}
        public async Task<bool> SoftDeleteFeedbackAsync(int feedbackId)
        {
            var feedback = await _feedbackRepo.GetQueryable()
                                              .FirstOrDefaultAsync(f => f.Id == feedbackId && !f.IsDeleted);
            if (feedback == null)
                return false;

            feedback.IsDeleted = true;
            feedback.DeletedAt = DateTime.UtcNow;

            _feedbackRepo.Update(feedback);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
