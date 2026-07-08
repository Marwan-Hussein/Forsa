using Application.Core.DTOs.Feedbacks;
using Application.Core.Interfaces.FeedbackInterfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        public FeedbackController(IFeedbackService _feedbackService)
        {
            this._feedbackService = _feedbackService;
        }
        [HttpGet("{feedbackId:int}")]
        public async Task<ActionResult<UpdateFeedbackDTO>> GetFeedbackById(int feedbackId)
        {
            try
            {
                var feedback = await _feedbackService.GetFeedbackById(feedbackId);
                if (feedback == null)
                {
                    return NotFound(new { message = "Feedback not found." });
                }
                return Ok(feedback);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving feedback.", details = ex.Message });
            }
        }
    }
}
