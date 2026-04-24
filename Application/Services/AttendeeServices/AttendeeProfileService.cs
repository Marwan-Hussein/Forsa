using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using AutoMapper;
using Domain.Entities.AttendeeEntities;
using Domain.Interfaces.AttendeeInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.AttendeeServices
{
    public class AttendeeProfileService : IAttendeeProfileService
    {
        private readonly IAttendeeProfileRepository _repo;
        private readonly IMapper _mapper;
        public AttendeeProfileService(IAttendeeProfileRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }
        public AttendeeProfileDto? GetProfile(int attendeeId)
        {
            var attendee = _repo.GetAttendeeWithInterests(attendeeId);
            if (attendee == null) return null;
            return _mapper.Map<AttendeeProfileDto>(attendee);
        }
        public AttendeeProfileDto? UpdateInterests(int attendeeId, List<int> interestIds)
        {
            var attendee = _repo.GetAttendeeWithInterests(attendeeId);
            if (attendee == null) return null;
            var requestedIds = (interestIds ?? new List<int>()).Distinct().ToList();
            var validIds = _repo.GetValidInterestIds(requestedIds);
            _repo.UpdateAttendeeInterests(attendee, validIds);
            _repo.SaveChanges();
            var updated = _repo.GetAttendeeWithInterests(attendeeId);
            return updated == null ? null : _mapper.Map<AttendeeProfileDto>(updated);
        }
        //private static AttendeeProfileDto MapToDto(Attendee attendee)
        //{
        //    return new AttendeeProfileDto
        //    {
        //        Id = attendee.Id,
        //        FullName = attendee.FullName,
        //        UserName = attendee.UserName,
        //        Email = attendee.Email,
        //        PhoneNumber = attendee.PhoneNumber,
        //        Location = attendee.Location,
        //        BirthDate = attendee.BirthDate,
        //        ProfilePicture = attendee.ProfilePicture,
        //        LoyaltyPoint = attendee.LoyaltyPoint,
        //        Interests = attendee.AttendeeInterestesWithAttendee
        //            .Select(j => new InterestDto
        //            {
        //                Id = j.AttendeeInterest.InterestId,
        //                Name = j.AttendeeInterest.InterestName
        //            })
        //            .ToList()
        //    };
        //}
    }
}
