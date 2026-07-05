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
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Name : src.CustomLocation))
                .ForMember(dest => dest.PlaceLocation,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Location : src.CustomLocation))
                .ForMember(dest => dest.PlaceLatitude,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Latitude : null))
                .ForMember(dest => dest.PlaceLongitude,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.Longitude : null))
                .ForMember(dest => dest.GooglePlaceId,
                           opt => opt.MapFrom(src => src.Place != null ? src.Place.GooglePlaceId : null))
                .ForMember(dest => dest.CustomLocation,
                           opt => opt.MapFrom(src => src.CustomLocation))
                .ForMember(dest => dest.ImageUrl,
                           opt => opt.MapFrom(src => src.EventMedias != null && src.EventMedias.Any(m => !m.IsDeleted) 
                               ? src.EventMedias.FirstOrDefault(m => !m.IsDeleted).MediaUrl 
                               : null))
                .ForMember(dest => dest.OrganizerId,
                           opt => opt.MapFrom(src => src.OrganizerId))
                .ForMember(dest => dest.OrganizerName,
                           opt => opt.MapFrom(src => src.Organizer != null ? src.Organizer.OrganizationName : null))
                .ForMember(dest => dest.OrganizerFollowersCount,
                           opt => opt.MapFrom(src => src.Organizer != null && src.Organizer.AttendeeSubsOrganizers != null ? src.Organizer.AttendeeSubsOrganizers.Count : 0));
        }
    }
}
