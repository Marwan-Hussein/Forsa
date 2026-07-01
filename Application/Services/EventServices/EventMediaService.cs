using Application.Core.DTOs.Event;
using Application.Core.Interfaces.EventInterfaces;
using AutoMapper;
using Domain.Entities.EventEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services.EventServices
{
    public class EventMediaService : IEventMediaService
    {
        private readonly IEventRepository _eventRepo;
        private readonly IQueryableRepository<EventMedia> _mediaRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _env;

        // Allowed extensions & size limits
        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long MaxImageSizeBytes = 5 * 1024 * 1024;    // 5 MB

        public EventMediaService(
            IEventRepository eventRepo,
            IQueryableRepository<EventMedia> mediaRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IWebHostEnvironment env)
        {
            _eventRepo = eventRepo;
            _mediaRepo = mediaRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _env = env;
        }

        public async Task<List<EventMediaDto>> UploadEventMediaAsync(
            int organizerId, int eventId, List<EventMediaUploadDto> mediaFiles)
        {
            // 1. Verify event ownership
            var ev = await _eventRepo.GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted);
            
            if (ev == null)
                throw new KeyNotFoundException("Event not found or you don't own this event.");

            var uploadedMedia = new List<EventMedia>();

            foreach (var media in mediaFiles)
            {
                // 2. Validate file
                var extension = Path.GetExtension(media.File.FileName).ToLowerInvariant();
                var isImage = AllowedImageExtensions.Contains(extension);

                if (!isImage)
                    throw new InvalidOperationException(
                        $"File '{media.File.FileName}' has an unsupported type. Allowed: {string.Join(", ", AllowedImageExtensions)}");

                if (isImage && media.File.Length > MaxImageSizeBytes)
                    throw new InvalidOperationException(
                        $"Image '{media.File.FileName}' exceeds 5 MB limit.");

                // 3. Save file to disk
                var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "events", eventId.ToString());
                Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await media.File.CopyToAsync(stream);
                }

                // 4. Create entity
                var eventMedia = new EventMedia
                {
                    MediaUrl = $"/uploads/events/{eventId}/{fileName}",
                    MediaType = "Image", // or MediaType.Image if enum
                    EventId = eventId,
                    CreatedAt = DateTime.UtcNow
                };

                await _mediaRepo.AddAsync(eventMedia);
                uploadedMedia.Add(eventMedia);
            }

            await _unitOfWork.SaveChangesAsync();
            
            var result = new List<EventMediaDto>();
            foreach(var m in uploadedMedia) {
                result.Add(new EventMediaDto {
                    Id = m.Id,
                    MediaUrl = m.MediaUrl,
                    MediaType = m.MediaType
                });
            }
            return result;
        }

        public async Task<bool> DeleteEventMediaAsync(int organizerId, int eventId, int mediaId)
        {
            var ev = await _eventRepo.GetQueryable()
                .Include(e => e.EventMedias)
                .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted);

            if (ev == null)
                throw new KeyNotFoundException("Event not found or you don't own this event.");

            var mediaItem = ev.EventMedias?.FirstOrDefault(m => m.Id == mediaId && !m.IsDeleted);
            if (mediaItem == null)
                throw new KeyNotFoundException("Media not found.");

            // Soft delete
            mediaItem.IsDeleted = true;
            mediaItem.DeletedAt = DateTime.UtcNow;

            _mediaRepo.Update(mediaItem);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
