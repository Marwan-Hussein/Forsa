using Application.Core.DTOs.Auth;
using AutoMapper;
using Domain.Entities;

namespace Application.Mapping
{
    public class AuthProfile : Profile
    {
        public AuthProfile()
        {
            CreateMap<RegisterDto, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));

            CreateMap<RegisterDto, Domain.Entities.OwnerEntities.Owner>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));
                
            CreateMap<RegisterDto, Domain.Entities.AttendeeEntities.Attendee>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));
                
            //CreateMap<RegisterDto, Domain.Entities.OrganizerEntities.Organizer>()
            //    .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            //    .ForMember(dest => dest.OrganizationName, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.OrganizationName) ? src.FullName : src.OrganizationName));

            CreateMap<RegisterDto, Domain.Entities.OrganizerEntities.Organizer>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));
        }
    }
}
