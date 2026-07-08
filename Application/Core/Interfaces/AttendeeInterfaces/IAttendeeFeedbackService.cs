using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.DTOs.Feedbacks;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.AttendeeInterfaces
{
    public interface IAttendeeFeedbackService
    {
        Task<FeedbackResponseDto> SubmitAttendeeFeedbackAsync(int attendeeId, int eventId, FeedbackDto dto);
        Task<UpdateFeedbackDTO> EditAttendeeFeedbackAsync(int attendeeId,int eventId, UpdateFeedbackDTO dto);
        Task DeleteAttendeeFeedbackAsync(int attendeeId,int eventId);
        Task<UpdateFeedbackDTO> GetMyFeedbackAsync(int attendeeId, int eventId);
    }
}
