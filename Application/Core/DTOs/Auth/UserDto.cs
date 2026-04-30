using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Auth
{
    public class UserDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpireOn { get; set; }
    }
}
