using Application.Core.DTOs.Feedbacks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.FeedbackInterfaces
{
    public interface IFeedbackService
    {
        Task<UpdateFeedbackDTO> GetFeedbackById(int id);
    }
}
