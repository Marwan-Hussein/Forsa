using Application.Core.DTOs.AttendeeDTOs;


namespace Application.Core.Interfaces.AdminServices
{
    public interface IAttendeeAdminService
    {
        Task<List<AttendeeProfileDto>> GetAllAsync(AttendeeSearchParameters parameters);
        Task<AttendeeProfileDto?> GetByIdAsync(int attendeeId);
        Task<AttendeeProfileDto?> UpdateAsync(int attendeeId, UpdateAttendeeProfileDto request);
        Task<bool> SoftDeleteAsync(int attendeeId);
    }
}
