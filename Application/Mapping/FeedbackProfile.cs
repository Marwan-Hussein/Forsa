using Application.Core.DTOs.AttendeeDTOs;
using AutoMapper;
using Domain.Entities;

namespace Application.Mapping
{
    public class FeedbackProfile : Profile
    {
        public FeedbackProfile()
        {
            CreateMap<Feedback, FeedbackResponseDto>()
                .ForMember(dest => dest.FeedbackId,
                           opt => opt.MapFrom(src => src.Id));
        }
    }
}
