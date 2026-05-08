using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Organizer
{
    public class OrganizerSearchParameters : CommonDTOs.CommonSearchParameters
    {
        public string? OrganizationName { get; set; }
    }
}
