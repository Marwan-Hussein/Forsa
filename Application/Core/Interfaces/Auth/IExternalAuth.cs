using Application.Core.DTOs.Auth;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.Auth
{
    public interface IExternalAuth 
    {
        //Task<UserDto> GoogleSignInAsync(string googleToken);
        Task<ExternalLoginInfo> GetExternalLoginInfoAsync();
        Task<UserDto> ProcessExternalLoginAsync(ExternalLoginInfo info);

    }
}
