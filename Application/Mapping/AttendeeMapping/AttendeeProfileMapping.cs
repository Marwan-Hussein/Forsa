using Application.Core.DTOs.AttendeeDTOs;
using AutoMapper;
using Domain.Entities.AttendeeEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Mapping.AttendeeMapping
{
    public class AttendeeProfileMapping : Profile
    {
        public AttendeeProfileMapping()
        {

            CreateMap<Attendee, AttendeeProfileDto>()
                .ForMember(dest => dest.Interests, opt => opt.MapFrom(src =>
                    src.AttendeeInterestesWithAttendee.Select(j => new InterestDto
                    {
                        Id = j.AttendeeInterest.InterestId,
                        Name = j.AttendeeInterest.InterestName
                    })));
        }
    }
}
