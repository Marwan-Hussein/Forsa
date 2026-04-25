using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using AutoMapper;
using Domain.Entities.AttendeeEntities;
using Domain.Interfaces;
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
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public AttendeeProfileService(IAttendeeProfileRepository repo, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _repo = repo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<AttendeeProfileDto?> GetProfileAsync(int attendeeId)
        {
            var attendee = await _repo.GetAttendeeWithInterestsAsync(attendeeId);
            if (attendee == null) return null;
            return _mapper.Map<AttendeeProfileDto>(attendee);
        }
        public async Task<AttendeeProfileDto?> UpdateProfileAsync(int attendeeId, UpdateAttendeeProfileDto request)
        {
            var attendee = await _repo.GetAttendeeWithInterestsAsync(attendeeId);
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

            await _unitOfWork.SaveChangesAsync();

            var updated = await _repo.GetAttendeeWithInterestsAsync(attendeeId);
            return updated == null ? null : _mapper.Map<AttendeeProfileDto>(updated);
        }
        public async Task<AttendeeProfileDto?> UpdateInterestsAsync(int attendeeId, List<int> interestIds)
        {
            var attendee = await _repo.GetAttendeeWithInterestsAsync(attendeeId);
            if (attendee == null) return null;
            var requestedIds = (interestIds ?? new List<int>()).Distinct().ToList();
            var validIds = await _repo.GetValidInterestIdsAsync(requestedIds);
            _repo.UpdateAttendeeInterests(attendee, validIds);
            await _unitOfWork.SaveChangesAsync();
            var updated = await _repo.GetAttendeeWithInterestsAsync(attendeeId);
            return updated == null ? null : _mapper.Map<AttendeeProfileDto>(updated);
        }

        public async Task<List<InterestDto>> GetAllInterestsAsync()
        {
            return (await _repo.GetAllInterestsAsync())
                        .Select(i => new InterestDto { Id = i.Id, Name = i.InterestName })
                        .ToList();
        }
    }
}
