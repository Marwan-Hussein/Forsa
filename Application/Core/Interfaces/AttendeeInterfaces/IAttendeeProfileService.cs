using Application.Core.DTOs.AttendeeDTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.AttendeeInterfaces
{
    public interface IAttendeeProfileService
    {
        Task<AttendeeProfileDto?> GetProfileAsync(int attendeeId);
        Task<AttendeeProfileDto?> UpdateProfileAsync(int attendeeId, UpdateAttendeeProfileDto request);
        Task<AttendeeProfileDto?> UpdateInterestsAsync(int attendeeId, List<int> interestIds);
        Task<List<InterestDto>> GetAllInterestsAsync();
    }
}
