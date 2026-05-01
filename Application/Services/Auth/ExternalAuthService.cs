using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Application.Services.Auth
{
    public class ExternalAuthService(UserManager<ApplicationUser> userManager
                                    , IJwtService jwtService) : IExternalAuth
    {

            // proceedure 
            // check if the info was in the data base 
            // if it was existed --> generate jwt token to frontend 
            // if the only  email exist --> update data base
            // if info isn't existed  --> create new user and store it in data base 



          public async Task<UserDto> ProcessExternalLoginAsync(ExternalAuthDto dto){
                    var user = await userManager.FindByLoginAsync(dto.Provider, dto.ProviderKey);

                    if (user == null)
                    {
                        user = await userManager.FindByEmailAsync(dto.Email);
                        if (user != null)
                        {
                            var loginInfo = new UserLoginInfo(dto.Provider, dto.ProviderKey, dto.Provider);
                            await userManager.AddLoginAsync(user, loginInfo);
                        }
                    }

                    if (user == null)
                    {
                        user = new ApplicationUser { UserName = dto.Email, Email = dto.Email };
                        await userManager.CreateAsync(user);

                        var loginInfo = new UserLoginInfo(dto.Provider, dto.ProviderKey, dto.Provider);
                        await userManager.AddLoginAsync(user, loginInfo);
                    }

                    return new UserDto
                    {
                        FullName = dto.Name,
                        Email = user.Email,
                        Token = jwtService.GenerateToken(user),
                        ExpireOn = DateTime.UtcNow.AddDays(1)
                    };
          }
    }
}
