using Application.Core.DTOs.Place;
using AutoMapper;
using Domain.Entities.PlaceEntities;
using Domain.ENUMs;

namespace Application.Mapping
{
    public class PlaceProfile : Profile
    {
        public PlaceProfile()
        {
            CreateMap<Place, PlaceDetailsDto>()
                .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.FacilityName, o => o.MapFrom(s => s.FacilityName.ToString()));

            CreateMap<AddPlaceDto, Place>()
                .ForMember(d => d.FacilityName, o => o.MapFrom(s => (FacilityName)s.FacilityName));
        }
    }
}
