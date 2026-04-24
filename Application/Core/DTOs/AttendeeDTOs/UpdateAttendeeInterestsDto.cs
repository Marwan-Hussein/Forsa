using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.AttendeeDTOs
{
    public class UpdateAttendeeInterestsDto
    {
        public List<int> InterestIds { get; set; } = new();

    }
}
