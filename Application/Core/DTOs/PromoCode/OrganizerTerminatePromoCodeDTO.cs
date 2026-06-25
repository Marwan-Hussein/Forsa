using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.PromoCode
{
    public class OrganizerTerminatePromoCodeDTO
    {
        public int PromoCodeId { get; set; }
        public int OrganizerId { get; set; }
        public string Code { get; set; }
    }
}
