using Application.Core.DTOs.Organizer;
using Application.Core.DTOs.Owner;
using Application.Core.DTOs.UserDTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;

namespace Application.Mapping
{
    public class UserProfileMapping : Profile
    {
        public UserProfileMapping()
        {
            // Base User to Base DTO
            CreateMap<ApplicationUser, UserProfileDto>()
                .ForMember(dest => dest.Role, opt => opt.Ignore()); // Role is handled in the service

            // Organizer to Organizer DTO
            CreateMap<Organizer, OrganizerProfileDto>()
                .IncludeBase<ApplicationUser, UserProfileDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => "Organizer"));

            // Owner to Owner DTO
            CreateMap<Owner, OwnerProfileDto>()
                .IncludeBase<ApplicationUser, UserProfileDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => "Owner"));
        }
    }
}
