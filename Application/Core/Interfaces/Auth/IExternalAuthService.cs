using Application.Core.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.Auth
{
    public interface IExternalAuthService
    {
        public Task<ExternalAuthResponseDto> ProcessExternalLoginAsync(ExternalAuthDto dto);
    }
}
