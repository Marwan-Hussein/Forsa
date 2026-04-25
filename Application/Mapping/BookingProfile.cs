using Application.Core.DTOs.Booking;
using AutoMapper;
using Domain.Entities.BookingEntities;

namespace Application.Mapping
{
    public class BookingProfile : Profile
    {
        public BookingProfile()
        {
            CreateMap<Booking, BookingResponseDto>()
                .ForMember(dest => dest.EventTitle,
                           opt => opt.MapFrom(src => src.Event.Title))
                .ForMember(dest => dest.Status,
                           opt => opt.MapFrom(src => src.Status.ToString()));
        }
    }
}
