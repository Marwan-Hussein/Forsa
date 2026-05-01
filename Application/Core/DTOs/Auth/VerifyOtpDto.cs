using System.ComponentModel.DataAnnotations;

namespace Application.Core.DTOs.Auth
{
    public class VerifyOtpDto
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "OTP code is required.")]
        [StringLength(6, MinimumLength = 5, ErrorMessage = "OTP must be 5 or 6 digits.")]
        public string Otp { get; set; } = null!;
    }
}
