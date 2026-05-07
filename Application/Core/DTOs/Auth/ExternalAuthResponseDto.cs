using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Auth
{
    public class ExternalAuthResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public UserDto User { get; set; }
    }
}
