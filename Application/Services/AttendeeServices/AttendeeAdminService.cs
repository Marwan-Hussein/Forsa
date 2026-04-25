using Application.Core.DTOs.AttendeeDTOs;
using Application.Core.Interfaces.AttendeeInterfaces;
using Application.Queries.Attendees;
using AutoMapper;
using Domain.Interfaces;
using Domain.Interfaces.AttendeeInterfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services.AttendeeServices
{
    public class AttendeeAdminService : IAttendeeAdminService
    {
        private readonly IAttendeeRepository _repo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AttendeeAdminService(
            IAttendeeRepository repo,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _repo = repo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<AttendeeProfileDto>> GetAllAsync(AttendeeSearchParameters parameters)
        {
            parameters ??= new AttendeeSearchParameters();

            var attendees = await _repo.GetQueryable()
                                       .Where(a => !a.IsDeleted)
                                       .ApplyFilters(parameters)
                                       .ApplySorting(parameters)
                                       .ToListAsync();

            return _mapper.Map<List<AttendeeProfileDto>>(attendees);
        }

        public async Task<AttendeeProfileDto?> GetByIdAsync(int attendeeId)
        {
            var attendee = await _repo.GetQueryable()
                                      .FirstOrDefaultAsync(a => a.Id == attendeeId && !a.IsDeleted);

            return attendee == null ? null : _mapper.Map<AttendeeProfileDto>(attendee);
        }

        public async Task<AttendeeProfileDto?> UpdateAsync(int attendeeId, UpdateAttendeeProfileDto request)
        {
            var attendee = await _repo.GetQueryable()
                                      .FirstOrDefaultAsync(a => a.Id == attendeeId);
            if (attendee == null || attendee.IsDeleted)
                return null;

            attendee.FullName = request.FullName.Trim();
            attendee.UserName = request.UserName.Trim();
            attendee.NormalizedUserName = attendee.UserName.ToUpperInvariant();
            attendee.Email = request.Email.Trim();
            attendee.NormalizedEmail = attendee.Email.ToUpperInvariant();
            attendee.PhoneNumber = request.PhoneNumber.Trim();
            attendee.Location = request.Location.Trim();
            attendee.BirthDate = request.BirthDate;
            attendee.LastModifiedAt = DateTime.UtcNow;

            _repo.Update(attendee);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _repo.GetQueryable()
                                     .FirstOrDefaultAsync(a => a.Id == attendeeId);
            return updated == null ? null : _mapper.Map<AttendeeProfileDto>(updated);
        }

        public async Task<bool> SoftDeleteAsync(int attendeeId)
        {
            var attendee = await _repo.GetQueryable()
                                      .FirstOrDefaultAsync(a => a.Id == attendeeId);
            if (attendee == null || attendee.IsDeleted)
                return false;

            attendee.IsDeleted = true;
            attendee.DeletedAt = DateTime.UtcNow;

            _repo.Update(attendee);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}