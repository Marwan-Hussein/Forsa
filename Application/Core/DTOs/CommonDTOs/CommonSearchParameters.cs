using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.CommonDTOs
{
    public class CommonSearchParameters
    {
        public string? FullName { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Location { get; set; }
        public bool IsDescending { get; set; }
    }
}
