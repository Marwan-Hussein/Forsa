namespace Application.Core.DTOs.AttendeeDTOs
{
    public class AttendeeSearchParameters
    {
        public string? FullName { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Location { get; set; }
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; }
    }
}
