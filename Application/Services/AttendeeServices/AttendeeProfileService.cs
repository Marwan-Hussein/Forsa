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
        public AttendeeProfileDto? UpdateProfile(int attendeeId, UpdateAttendeeProfileDto request)
        {
            var attendee = _repo.GetAttendeeWithInterests(attendeeId);
            if (attendee == null) return null;

            attendee.FullName = request.FullName.Trim();
            attendee.UserName = request.UserName.Trim();
            attendee.NormalizedUserName = attendee.UserName.ToUpperInvariant();
            attendee.Email = request.Email.Trim();
            attendee.NormalizedEmail = attendee.Email.ToUpperInvariant();
            attendee.PhoneNumber = request.PhoneNumber.Trim();
            attendee.Location = request.Location.Trim();
            attendee.BirthDate = request.BirthDate;
            attendee.LastModifiedAt = DateTime.UtcNow;

            _repo.SaveChanges();

            var updated = _repo.GetAttendeeWithInterests(attendeeId);
            return updated == null ? null : _mapper.Map<AttendeeProfileDto>(updated);
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
    }
}
