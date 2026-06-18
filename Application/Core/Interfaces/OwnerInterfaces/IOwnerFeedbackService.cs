using Application.Core.DTOs.Owner;

namespace Application.Core.Interfaces.OwnerInterfaces
{
    public interface IOwnerFeedbackService
    {
        Task<OrganizerFeedbackResponseDto> SubmitOrganizerFeedbackAsync(int ownerId, int bookingRequestId, OrganizerFeedbackDto dto);
    }
}
