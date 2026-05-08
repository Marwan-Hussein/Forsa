using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Owner
{
    public class OwnerSearchParameters : CommonDTOs.CommonSearchParameters
    {
        public string? PlaceName { get; set; }
    }
}
