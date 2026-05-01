using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Auth
{
    public class ExternalAuthDto
    {
        public string Provider { get; set; }
        public string ProviderKey { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
    }
}
