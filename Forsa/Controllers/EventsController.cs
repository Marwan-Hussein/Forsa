using Application.Core.DTOs.Event;
using Application.Core.Interfaces;
using AutoMapper;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Domain.Entities.EventEntities;

namespace Forsa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IMapper _mapper;
        private readonly IValidator<EventSearchParameter> _validator;

        public EventsController(IEventService eventService, IMapper mapper, IValidator<EventSearchParameter> validator)
        {
            _eventService = eventService;
            _mapper = mapper;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<List<EventDetailsDto>>> GetAllEvents()
        {
            try
            {
                var events = _eventService.GetAll();
                var eventDtos = _mapper.Map<List<EventDetailsDto>>(events);
                return Ok(eventDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving events");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<EventDetailsDto>>> SearchEvents([FromQuery] EventSearchParameter parameters)
        {
            // FluentValidation
            var validationResult = await _validator.ValidateAsync(parameters);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .Select(e => new { field = e.PropertyName, message = e.ErrorMessage });
                return BadRequest(new { errors });
            }

            try
            {
                var events = _eventService.FilterEventsByParameters(parameters);
                var eventDtos = _mapper.Map<List<EventDetailsDto>>(events);
                return Ok(eventDtos);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while searching events");
            }
        }

        [HttpGet("{id}/details")]
        public async Task<ActionResult<EventDetailsDto>> GetEventDetails(int id)
        {
            try
            {
                var eventDetails = _eventService.GetById(id);
                if (eventDetails == null)
                    return NotFound("Event not found");
                
                var eventDto = _mapper.Map<EventDetailsDto>(eventDetails);
                return Ok(eventDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving event details");
            }
        }
    }
}
