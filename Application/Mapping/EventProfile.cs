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
                .ForMember(dest => dest.EventId,
                           opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Status,
                           opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.PlaceId,
                           opt => opt.MapFrom(src => src.PlaceId))
                .ForMember(dest => dest.Place,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Name : null))
                .ForMember(dest => dest.PlaceLocation,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Location : null))
                .ForMember(dest => dest.PlaceLatitude,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Latitude : null))
                .ForMember(dest => dest.PlaceLongitude,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Longitude : null))
                .ForMember(dest => dest.GooglePlaceId,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.GooglePlaceId : null));
        }
    }
}
