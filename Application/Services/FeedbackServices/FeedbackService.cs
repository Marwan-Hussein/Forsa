using Application.Core.DTOs.Feedbacks;
using Application.Core.Interfaces.FeedbackInterfaces;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.FeedbackServices
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _feedbackRepository;
        public FeedbackService(IFeedbackRepository _feedbackRepository)
        {
            this._feedbackRepository = _feedbackRepository;
        }
        public async Task<UpdateFeedbackDTO> GetFeedbackById(int id)
        {
            var feedback = await _feedbackRepository.GetByIdAsync(id);
            if (feedback == null)
            {
                throw new Exception($"Feedback not found.");
            }
            return new UpdateFeedbackDTO
            {
                Rating = feedback.Rating,
                Comment = feedback.Comment
            };
        }
    }
}
