using Application.Authorization.Requirements;
using Domain.Entities.BookingEntities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Application.Authorization.Handlers
{
    public class BookingOwnerHandler : AuthorizationHandler<ResourceOwnerRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IGenericRepository<Booking> _bookingRepository;

        public BookingOwnerHandler(IHttpContextAccessor httpContextAccessor, IGenericRepository<Booking> bookingRepository)
        {
            _httpContextAccessor = httpContextAccessor;
            _bookingRepository = bookingRepository;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            ResourceOwnerRequirement requirement)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
            {
                context.Fail();
                return;
            }

            // Admins can bypass ownership checks
            if (context.User.IsInRole("Admin"))
            {
                context.Succeed(requirement);
                return;
            }

            var routeId = httpContext?.GetRouteValue("id")?.ToString();
            if (routeId == null || !int.TryParse(routeId, out var bookingId))
            {
                context.Fail();
                return;
            }

            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking != null && booking.AttendeeId.ToString() == userIdClaim)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
        }
    }
}
