using Application.Core.DTOs.Place;
using Application.Core.Interfaces.PlaceInterfaces;
using AutoMapper;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.PlaceServices
{
    public class PlaceMediaService : IPlaceMediaService
    {
        private readonly IPlaceRepository _placeRepo;
        private readonly IQueryableRepository<PlaceMedia> _mediaRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _env;

        // Allowed extensions & size limits
        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
        private static readonly string[] AllowedVideoExtensions = { ".mp4", ".webm" };
        private const long MaxImageSizeBytes = 5 * 1024 * 1024;    // 5 MB
        private const long MaxVideoSizeBytes = 50 * 1024 * 1024;   // 50 MB

        public PlaceMediaService(
            IPlaceRepository placeRepo,
            IQueryableRepository<PlaceMedia> mediaRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IWebHostEnvironment env)
        {
            _placeRepo = placeRepo;
            _mediaRepo = mediaRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _env = env;
        }

        public async Task<List<PlaceMediaDto>> UploadPlaceMediaAsync(
            int ownerId, int placeId, List<MediaUploadDto> mediaFiles)
        {
            // 1. Verify place ownership
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);
            if (place == null)
                throw new KeyNotFoundException("Place not found or you don't own this place.");

            var uploadedMedia = new List<PlaceMedia>();

            foreach (var media in mediaFiles)
            {
                // 2. Validate file
                var extension = Path.GetExtension(media.File.FileName).ToLowerInvariant();
                var isImage = AllowedImageExtensions.Contains(extension);
                var isVideo = AllowedVideoExtensions.Contains(extension);

                if (!isImage && !isVideo)
                    throw new InvalidOperationException(
                        $"File '{media.File.FileName}' has an unsupported type. Allowed: {string.Join(", ", AllowedImageExtensions.Concat(AllowedVideoExtensions))}");

                if (isImage && media.File.Length > MaxImageSizeBytes)
                    throw new InvalidOperationException(
                        $"Image '{media.File.FileName}' exceeds 5 MB limit.");

                if (isVideo && media.File.Length > MaxVideoSizeBytes)
                    throw new InvalidOperationException(
                        $"Video '{media.File.FileName}' exceeds 50 MB limit.");

                // 3. Save file to disk
                var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "places", placeId.ToString());
                Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await media.File.CopyToAsync(stream);
                }

                // 4. Create entity
                var placeMedia = new PlaceMedia
                {
                    MediaURL = $"/uploads/places/{placeId}/{fileName}",
                    MediaType = isImage ? MediaType.Image : MediaType.Video,
                    PlaceId = placeId,
                    CreatedAt = DateTime.UtcNow
                };

                await _mediaRepo.AddAsync(placeMedia);
                uploadedMedia.Add(placeMedia);
            }

            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<List<PlaceMediaDto>>(uploadedMedia);
        }

        public async Task<bool> DeletePlaceMediaAsync(int ownerId, int placeId, int mediaId)
        {
            // 1. Verify ownership
            var place = await _placeRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == placeId && p.OwnerId == ownerId && !p.IsDeleted);
            if (place == null)
                throw new KeyNotFoundException("Place not found or you don't own this place.");

            // 2. Find media
            var media = await _mediaRepo.GetQueryable()
                .FirstOrDefaultAsync(m => m.Id == mediaId && m.PlaceId == placeId && !m.IsDeleted);
            if (media == null) return false;

            // 3. Ensure at least 1 media remains
            var remainingCount = await _mediaRepo.GetQueryable()
                .CountAsync(m => m.PlaceId == placeId && !m.IsDeleted && m.Id != mediaId);
            if (remainingCount < 1)
                throw new InvalidOperationException(
                    "Cannot delete the last media item. A place must have at least one image.");

            // 4. Soft-delete entity
            media.IsDeleted = true;
            media.DeletedAt = DateTime.UtcNow;
            _mediaRepo.Update(media);
            await _unitOfWork.SaveChangesAsync();

            // 5. Delete physical file
            var physicalPath = Path.Combine(_env.WebRootPath ?? "wwwroot", media.MediaURL.TrimStart('/'));
            if (File.Exists(physicalPath)) File.Delete(physicalPath);

            return true;
        }

        public async Task<List<PlaceMediaDto>> GetPlaceMediaAsync(int placeId)
        {
            var media = await _mediaRepo.GetQueryable()
                .Where(m => m.PlaceId == placeId && !m.IsDeleted)
                .ToListAsync();

            return _mapper.Map<List<PlaceMediaDto>>(media);
        }
    }
}
