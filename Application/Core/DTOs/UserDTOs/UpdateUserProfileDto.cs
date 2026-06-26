namespace Application.Core.DTOs.UserDTOs
{
    public class UpdateUserProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
    }
}
