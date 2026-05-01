using System.ComponentModel.DataAnnotations;

namespace Application.Core.DTOs.Auth
{
    public class ResendOtpDto
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = null!;
    }
}
