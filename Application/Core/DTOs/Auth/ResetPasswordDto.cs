using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Auth
{
    public class ResetPasswordDto
    {
        [Required]
        public string Email { get; set; } = null!;
        [Required]
        public string Otp { get; set; }
        [Required]
        public string NewPassword { get; set; } = null!;
        [Required]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string ConfirmNewPassword { get; set; } = null!;
    }
}
