using Domain.Entities.OrganizerEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Organizer
{
    public class OrganizerDetails
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100,
            MinimumLength = 3,
            ErrorMessage = "Full name must be between 3 and 100 characters.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50,
            MinimumLength = 3,
            ErrorMessage = "Username must be between 3 and 50 characters.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(200,
            ErrorMessage = "Location cannot exceed 200 characters.")]
        public string Location { get; set; }

        [Required(ErrorMessage = "Birth date is required.")]
        [DataType(DataType.Date)]
        [Range(18,60,
            ErrorMessage = "Organizer must be at least 18 years old and at most 60.")]
        public DateTime BirthDate { get; set; }
        public string? ProfilePicture { get; set; }

        [Required(ErrorMessage = "Organization type is required.")]
        [MinLength(1,
            ErrorMessage = "At least one organization type is required.")]
        public List<OrganizationType> OrganizationType { get; set; }
    }
}
