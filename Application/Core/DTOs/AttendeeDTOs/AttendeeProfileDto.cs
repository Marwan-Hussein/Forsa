using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.AttendeeDTOs
{
    public class AttendeeProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Location { get; set; }
        public DateTime BirthDate { get; set; }
        public string ProfilePicture { get; set; }
        public int LoyaltyPoint { get; set; }
        public List<InterestDto> Interests { get; set; } = new();
    }
}
