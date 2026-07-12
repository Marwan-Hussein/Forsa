using Application.Core.DTOs.Place;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;
using Infrastructure.Data.DbContexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Forsa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlacesController : ControllerBase
    {
        private readonly ForsaDbContext _context;

        public PlacesController(ForsaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPlaces()
        {
            try
            {
                var places = await _context.Set<Place>()
                    .Include(p => p.PlaceMedias.Where(m => !m.IsDeleted))
                    .Include(p => p.PlaceAvailabilities.Where(a => !a.IsDeleted))
                    .Include(p => p.Feedbacks)
                    .Where(p => (p.Status == PlaceStatus.Approved || p.Status == PlaceStatus.Available) && !p.IsDeleted && !p.IsBlocked && !p.IsLocked)
                    .ToListAsync();

                var bookingRequests = await _context.Set<Domain.Entities.BookingEntities.BookingRequest>()
                    .Include(r => r.Event)
                    .Where(r => r.Status == RequestStatus.Accepted && !r.IsDeleted)
                    .ToListAsync();

                var placeDtos = places.Select(p => new PlaceSummaryDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Location = p.Location,
                    Capacity = p.Capacity,
                    DailyPrice = p.DailyPrice,
                    FacilityName = Enum.IsDefined(typeof(FacilityName), p.FacilityName) ? p.FacilityName.ToString() : "Standard Space",
                    Images = p.PlaceMedias.Select(m => m.MediaURL).ToList(),
                    Availabilities = p.PlaceAvailabilities.Where(a => {
                        if (a.Status == PlaceStatus.Booked)
                        {
                            var matchingRequest = bookingRequests.FirstOrDefault(r => r.PlaceId == p.Id && r.RequestedDate.Date == a.Date.Date);
                            if (matchingRequest?.Event != null)
                            {
                                var isCompletedEvent = matchingRequest.Event.Status == EventStatus.Completed || matchingRequest.Event.EndDate <= DateTime.UtcNow;
                                return !isCompletedEvent;
                            }
                        }
                        return true;
                    }).Select(a => new PlaceAvailabilityDto
                    {
                        Id = a.Id,
                        Date = a.Date,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        Status = a.Status.ToString(),
                        PlaceId = a.PlaceId
                    }).ToList(),
                    Rating = p.Feedbacks?.Any() == true ? p.Feedbacks.Average(f => f.Rating) : 0,
                    ReviewCount = p.Feedbacks?.Count ?? 0
                }).ToList();

                return Ok(placeDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching places: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlaceById(int id)
        {
            try
            {
                var place = await _context.Set<Place>()
                    .Include(p => p.Owner)
                    .Include(p => p.PlaceMedias.Where(m => !m.IsDeleted))
                    .Include(p => p.PlaceAvailabilities.Where(a => !a.IsDeleted))
                    .Include(p => p.Feedbacks)
                    .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

                if (place == null)
                    return NotFound($"Place with id {id} not found.");

                var bookingRequests = await _context.Set<Domain.Entities.BookingEntities.BookingRequest>()
                    .Include(r => r.Event)
                    .Where(r => r.PlaceId == id && r.Status == RequestStatus.Accepted && !r.IsDeleted)
                    .ToListAsync();

                var placeDto = new PlaceDetailsDto
                {
                    PlaceId = place.Id,
                    Name = place.Name,
                    Location = place.Location,
                    Capacity = place.Capacity,
                    Description = place.Description,
                    HourlyPrice = place.HourlyPrice,
                    DailyPrice = place.DailyPrice,
                    Status = place.Status.ToString(),
                    FacilityName = Enum.IsDefined(typeof(FacilityName), place.FacilityName) ? place.FacilityName.ToString() : "Standard Space",
                    IsLocked = place.IsLocked,
                    Reason = place.Reason,
                    OwnerId = place.OwnerId,
                    OwnerName = place.Owner?.FullName,
                    OwnerEmail = place.Owner?.Email,
                    OwnerPhone = place.Owner?.PhoneNumber,
                    CreatedAt = place.CreatedAt,
                    Latitude = place.Latitude,
                    Longitude = place.Longitude,
                    GooglePlaceId = place.GooglePlaceId,
                    Images = place.PlaceMedias?.Select(m => m.MediaURL).ToList() ?? new List<string>(),
                    Availabilities = place.PlaceAvailabilities?.Where(a => {
                        if (a.Status == PlaceStatus.Booked)
                        {
                            var matchingRequest = bookingRequests.FirstOrDefault(r => r.RequestedDate.Date == a.Date.Date);
                            if (matchingRequest?.Event != null)
                            {
                                var isCompletedEvent = matchingRequest.Event.Status == EventStatus.Completed || matchingRequest.Event.EndDate <= DateTime.UtcNow;
                                return !isCompletedEvent;
                            }
                        }
                        return true;
                    }).Select(a => new PlaceAvailabilityDto
                    {
                        Id = a.Id,
                        Date = a.Date,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        Status = a.Status.ToString(),
                        PlaceId = a.PlaceId
                    }).ToList() ?? new List<PlaceAvailabilityDto>(),
                    Rating = place.Feedbacks?.Any() == true ? place.Feedbacks.Average(f => f.Rating) : 0,
                    ReviewCount = place.Feedbacks?.Count ?? 0
                };

                return Ok(placeDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching place: {ex.Message}");
            }
        }
    }
}
