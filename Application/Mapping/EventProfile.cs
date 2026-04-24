using Application.Core.DTOs.Event;
using AutoMapper;
using Domain.Entities.EventEntities;

namespace Application.Mapping
{
    public class EventProfile : Profile
    {
        public EventProfile()
        {
            CreateMap<Event, EventDetailsDto>()
                .ForMember(dest => dest.Status,
                           opt => opt.MapFrom(src => src.Status.ToString()));
        }
    }
}
