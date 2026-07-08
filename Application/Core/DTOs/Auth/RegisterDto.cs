using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Auth
{
    public class RegisterDto
    {

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 100 characters.")]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [MaxLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Password is required.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Phone number is required.")]
        [RegularExpression(@"^(010|011|012|015)\d{8}$",
            ErrorMessage = "Invalid phone number. It must be a valid Egyptian mobile number.")]
        public string PhoneNumber { get; set; } = null!;

        public string Location { get; set; }

        public string? Role { get; set; }
        //[Required(ErrorMessage = "Username is required.")]
        [StringLength(30, MinimumLength = 3,
        ErrorMessage = "Username must be between 3 and 30 characters.")]
        [RegularExpression(@"^[a-zA-Z0-9_]+$",
        ErrorMessage = "Username can only contain letters, numbers, and underscores.")]
        public string UserName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Birthdate is required.")]
        [DataType(DataType.Date)]
        [MinimumAgeAttribute(16)]
        public DateTime birthdate { get; set; }

        //public string? OrganizationName { get; set; }
    }
}
