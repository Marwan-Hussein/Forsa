using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Core.DTOs.CommonDTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;

namespace Application.Mapping
{
    public class ApplicationUserProfile : Profile
    {
        public ApplicationUserProfile()
        {
            CreateMap<ApplicationUserDTO, Attendee>().ReverseMap();
            CreateMap<ApplicationUserDTO, Owner>().ReverseMap();
            CreateMap<ApplicationUserDTO, Organizer>().ReverseMap();
            CreateMap<ApplicationUserDTO, ApplicationUser>().ReverseMap();
        }
    }
}
