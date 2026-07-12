using Application.Core.DTOs.Organizer;
using Application.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.EventEntities;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/organizers")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class OrganizerProfileController : ControllerBase
    {
        private readonly IUserProfileService _profileService;

        public OrganizerProfileController(IUserProfileService profileService)
        {
            _profileService = profileService;
        }

        // GET: api/organizers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrganizerProfileDto>>> GetAllOrganizers([FromServices] ForsaDbContext context)
        {
            try
            {
                int? currentUserId = null;
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
                {
                    currentUserId = parsedId;
                }

                var organizers = await context.Set<Organizer>()
                    .Where(o => !o.IsDeleted)
                    .ToListAsync();

                var dtos = new List<OrganizerProfileDto>();
                foreach (var org in organizers)
                {
                    var followersCount = await context.Set<AttendeeSubsOrganizer>()
                        .CountAsync(s => s.OrganizerId == org.Id);

                    var eventsCount = await context.Set<Event>()
                        .CountAsync(e => e.OrganizerId == org.Id && !e.IsDeleted);

                    var isSubscribed = currentUserId.HasValue && await context.Set<AttendeeSubsOrganizer>()
                        .AnyAsync(s => s.OrganizerId == org.Id && s.AttendeeId == currentUserId.Value);

                    dtos.Add(new OrganizerProfileDto
                    {
                        Id = org.Id,
                        FullName = org.FullName,
                        Email = org.Email,
                        PhoneNumber = org.PhoneNumber,
                        Location = org.Location,
                        ProfilePicture = org.ProfilePicture,
                        OrganizationName = org.OrganizationName,
                        AverageRating = org.AverageRating,
                        ReviewsCount = org.ReviewsCount,
                        FollowersCount = followersCount,
                        EventsCount = eventsCount,
                        IsSubscribed = isSubscribed
                    });
                }

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching organizers: {ex.Message}");
            }
        }

        // GET: api/organizers/{id}/profile
        [HttpGet("{id:int}/profile")]
        public async Task<ActionResult<OrganizerProfileDto>> GetProfile(int id, [FromServices] ForsaDbContext context)
        {
            try
            {
                var org = await context.Set<Organizer>()
                    .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);
                if (org == null)
                    return NotFound(new { message = "Organizer not found." });

                int? currentUserId = null;
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
                {
                    currentUserId = parsedId;
                }

                var followersCount = await context.Set<AttendeeSubsOrganizer>()
                    .CountAsync(s => s.OrganizerId == id);

                var eventsCount = await context.Set<Event>()
                    .CountAsync(e => e.OrganizerId == id && !e.IsDeleted);

                var isSubscribed = currentUserId.HasValue && await context.Set<AttendeeSubsOrganizer>()
                    .AnyAsync(s => s.OrganizerId == id && s.AttendeeId == currentUserId.Value);

                var dto = new OrganizerProfileDto
                {
                    Id = org.Id,
                    FullName = org.FullName,
                    Email = org.Email,
                    PhoneNumber = org.PhoneNumber,
                    Location = org.Location,
                    ProfilePicture = org.ProfilePicture,
                    OrganizationName = org.OrganizationName,
                    AverageRating = org.AverageRating,
                    ReviewsCount = org.ReviewsCount,
                    FollowersCount = followersCount,
                    EventsCount = eventsCount,
                    IsSubscribed = isSubscribed
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching organizer profile: {ex.Message}");
            }
        }

        // PUT: api/organizers/{id}/profile
        [Authorize(Policy = "OrganizerOnly")]
        [HttpPut("{id:int}/profile")]
        public async Task<ActionResult<OrganizerProfileDto>> UpdateProfile(int id, [FromBody] UpdateOrganizerProfileDto dto)
        {
            try
            {
                var updated = await _profileService.UpdateOrganizerProfileAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Organizer not found." });
                return Ok(updated);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating organizer profile.");
            }
        }

        [HttpPost("{id}/profile-picture")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> UploadProfilePicture(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest("File is empty");
                var result = await _profileService.UploadProfilePictureAsync(id, file);
                return Ok(new { url = result });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}/profile-picture")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> RemoveProfilePicture(int id)
        {
            try
            {
                var result = await _profileService.RemoveProfilePictureAsync(id);
                if (!result) return NotFound(new { message = "No profile picture to remove." });
                return Ok(new { message = "Profile picture removed." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/organizers/{id}/subscribe
        [Authorize(Policy = "AuthenticatedUser")]
        [HttpPost("{id:int}/subscribe")]
        public async Task<IActionResult> ToggleSubscribe(int id, [FromServices] ForsaDbContext context)
        {
            try
            {
                var org = await context.Set<Organizer>().FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);
                if (org == null)
                    return NotFound(new { message = "Organizer not found." });

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var attendeeId))
                    return Unauthorized(new { message = "Not authenticated" });

                var existingSub = await context.Set<AttendeeSubsOrganizer>()
                    .FirstOrDefaultAsync(s => s.OrganizerId == id && s.AttendeeId == attendeeId);

                bool isSubscribed;
                if (existingSub != null)
                {
                    context.Set<AttendeeSubsOrganizer>().Remove(existingSub);
                    isSubscribed = false;
                }
                else
                {
                    await context.Set<AttendeeSubsOrganizer>().AddAsync(new AttendeeSubsOrganizer
                    {
                        AttendeeId = attendeeId,
                        OrganizerId = id
                    });
                    isSubscribed = true;
                }

                await context.SaveChangesAsync();

                var newFollowersCount = await context.Set<AttendeeSubsOrganizer>()
                    .CountAsync(s => s.OrganizerId == id);

                return Ok(new { isSubscribed, followersCount = newFollowersCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while toggling subscription: {ex.Message}");
            }
        }

        // GET: api/organizers/{id:int}/reviews
        [HttpGet("{id:int}/reviews")]
        public async Task<ActionResult<IEnumerable<Application.Core.DTOs.Organizer.OrganizerFeedbackDTO>>> GetOrganizerReviews(int id, [FromServices] ForsaDbContext context)
        {
            try
            {
                var reviews = await context.Set<Domain.Entities.Feedback>()
                    .Include(f => f.Event)
                    .Include(f => f.Attendee)
                    .Where(f => f.Event != null && f.Event.OrganizerId == id && !f.IsDeleted && f.AttendeeId != null && f.Attendee != null)
                    .OrderByDescending(f => f.CreatedAt)
                    .Select(f => new Application.Core.DTOs.Organizer.OrganizerFeedbackDTO
                    {
                        Id = f.Id,
                        Rating = f.Rating,
                        Comment = f.Comment,
                        AttendeeId = f.AttendeeId.Value,
                        AttendeeName = f.Attendee != null ? f.Attendee.FullName : string.Empty,
                        AttendeeImageUrl = f.Attendee != null ? f.Attendee.ProfilePicture : string.Empty,
                        EventId = f.EventId ?? 0,
                        EventTitle = f.Event != null ? f.Event.Title : string.Empty,
                        CreatedAt = f.CreatedAt
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching organizer reviews: {ex.Message}");
            }
        }
    }
}
