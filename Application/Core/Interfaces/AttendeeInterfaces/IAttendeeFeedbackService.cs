using Application.Core.DTOs.AttendeeDTOs;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.AttendeeInterfaces
{
    public interface IAttendeeFeedbackService
    {
        Task<FeedbackResponseDto> SubmitAttendeeFeedbackAsync(int attendeeId, int eventId, FeedbackDto dto);
    }
}
