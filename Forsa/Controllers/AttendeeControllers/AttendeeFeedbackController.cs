using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Forsa.Controllers.AttendeeControllers
{
    [ApiController]
    [Route("api/attendees/{attendeeId:int}/events/{eventId:int}/feedback")]
    [ApiConventionType(typeof(DefaultApiConventions))]
    public class AttendeeFeedbackController : ControllerBase
    {
        private readonly IAttendeeFeedbackService _feedbackService;
        private readonly IValidator<FeedbackDto> _validator;

        public AttendeeFeedbackController(IAttendeeFeedbackService feedbackService, IValidator<FeedbackDto> validator)
        {
            _feedbackService = feedbackService;
            _validator = validator;
        }

        // POST: api/attendees/{attendeeId}/events/{eventId}/feedback
        [Authorize(Policy = "AttendeeOnly")]
        [HttpPost]
        public async Task<ActionResult<FeedbackResponseDto>> SubmitFeedback(int attendeeId, int eventId, [FromBody] FeedbackDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Feedback content cannot be empty." });

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new { errors = validationResult.Errors });
                }

                var response = await _feedbackService.SubmitAttendeeFeedbackAsync(attendeeId, eventId, dto);
                return CreatedAtAction(nameof(SubmitFeedback), new { attendeeId, eventId }, response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting feedback.", details = ex.Message });
            }
        }
    }
}
