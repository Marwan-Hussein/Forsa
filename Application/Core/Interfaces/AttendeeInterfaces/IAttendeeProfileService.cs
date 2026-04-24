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
        AttendeeProfileDto? GetProfile(int attendeeId);
        AttendeeProfileDto? UpdateProfile(int attendeeId, UpdateAttendeeProfileDto request);
        AttendeeProfileDto? UpdateInterests(int attendeeId, List<int> interestIds);
        List<InterestDto> GetAllInterests();
    }
}
