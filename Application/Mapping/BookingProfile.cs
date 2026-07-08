using Application.Core.DTOs.AttendeeDTOs;
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
                .ForMember(dest => dest.BookingId,
                           opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.EventTitle,
                           opt => opt.MapFrom(src => src.Event.Title))
                .ForMember(dest => dest.Status,
                           opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<BookingRequest, BookingRequestDetailsDto>()
                .ForMember(d => d.RequestId, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.OrganizerName, o => o.MapFrom(s => s.Organizer.FullName))
                .ForMember(d => d.OrganizerEmail, o => o.MapFrom(s => s.Organizer.Email))
                .ForMember(d => d.OrganizationName, o => o.MapFrom(s => s.Organizer.OrganizationName))
                .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Place.Name))
                .ForMember(d => d.EventTitle, o => o.MapFrom(s => s.Event != null ? s.Event.Title : null))
                .ForMember(d => d.EventStatus, o => o.MapFrom(s => s.Event != null ? s.Event.Status.ToString() : null))
                .ForMember(d => d.EventEndDate, o => o.MapFrom(s => s.Event != null ? s.Event.EndDate : (DateTime?)null));

            CreateMap<Booking, AttendeeBookingDto>()
                .ForMember(d => d.BookingId, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.EventTitle, o => o.MapFrom(s => s.Event.Title))
                .ForMember(d => d.EventCategory, o => o.MapFrom(s => s.Event.Category))
                .ForMember(d => d.EventStartDate, o => o.MapFrom(s => s.Event.StartDate))
                .ForMember(d => d.EventEndDate, o => o.MapFrom(s => s.Event.EndDate))
                .ForMember(d => d.EventPlace, o => o.MapFrom(s => s.Event.Place != null ? s.Event.Place.Name : null))
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.EventStatus, o => o.MapFrom(s => s.Event.Status.ToString()));
        }
    }
}
