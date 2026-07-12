using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.DTOs.Feedbacks;
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
        private readonly IAttendeeFeedbackService AttendeefeedbackService;
        private readonly IValidator<UpdateFeedbackDTO> validator;
        private readonly IValidator<FeedbackDto> _validator;

        public AttendeeFeedbackController(IAttendeeFeedbackService AttendeefeedbackService, IValidator<UpdateFeedbackDTO> validator, IValidator<FeedbackDto> _validator)
        {
            this.AttendeefeedbackService = AttendeefeedbackService;
            this.validator = validator;
            this._validator = _validator;
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

                var response = await AttendeefeedbackService.SubmitAttendeeFeedbackAsync(attendeeId, eventId, dto);
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
        [Authorize(Policy = "AttendeeOnly")]
        [HttpPut]
        public async Task<ActionResult<FeedbackResponseDto>> EditFeedback(
    int attendeeId,
    int eventId,
    [FromBody] UpdateFeedbackDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Feedback content cannot be empty." });

                var validationResult = await validator.ValidateAsync(dto);

                if (!validationResult.IsValid)
                    return BadRequest(new { errors = validationResult.Errors });

                var response = await AttendeefeedbackService.EditAttendeeFeedbackAsync(attendeeId, eventId, dto);

                return Ok(response);
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
                return StatusCode(500, new
                {
                    message = "An error occurred while editing feedback.",
                    details = ex.Message
                });
            }
        }
        [Authorize(Policy = "AttendeeOnly")]
        [HttpDelete]
        public async Task<ActionResult> DeleteFeedback(
    int attendeeId,
    int eventId)
        {
            try
            {
                await AttendeefeedbackService.DeleteAttendeeFeedbackAsync(attendeeId, eventId);

                return NoContent();
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
                return StatusCode(500, new
                {
                    message = "An error occurred while deleting feedback.",
                    details = ex.Message
                });
            }
        }
        [Authorize(Policy = "AttendeeOnly")]
        [HttpGet]
        public async Task<ActionResult<FeedbackDto>> GetMyFeedback(
    int attendeeId,
    int eventId)
        {
            try
            {
                var feedback = await AttendeefeedbackService.GetMyFeedbackAsync(attendeeId, eventId);

                return Ok(feedback);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving feedback.",
                    details = ex.Message
                });
            }
        }
    }
}
