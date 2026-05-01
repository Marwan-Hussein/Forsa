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
    public class ExternalAuthService(SignInManager<ApplicationUser> signInManager
                                    , UserManager<ApplicationUser> userManager
                                    , IJwtService jwtService) : IExternalAuth
    {
        public async Task<ExternalLoginInfo> GetExternalLoginInfoAsync()
        {
           return await signInManager.GetExternalLoginInfoAsync();
        }

        public async Task<UserDto> ProcessExternalLoginAsync(ExternalLoginInfo info)
        {
            // proceedure 
            // check if the info was in the data base 
            // if it was existed --> generate jwt token to frontend 
            // if the only  email exist --> update data base
            // if info isn't existed  --> create new user and store it in data base 



            var email = info.Principal.FindFirstValue(ClaimTypes.Email)
                ?? throw new Exception("Email is required from Google.");
            var name = info.Principal.FindFirstValue(ClaimTypes.Name);

            var user = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

            if (user == null)
            {
                user = await userManager.FindByEmailAsync(email);
                if (user != null)
                {
                    await userManager.AddLoginAsync(user, info); 
                }
            }

            if (user == null)
            {
                user = new ApplicationUser { UserName = email, Email = email };
                await userManager.CreateAsync(user);
                await userManager.AddLoginAsync(user, info); 
            }


            // user isn't found 
            return new UserDto
            {
                FullName = name,
                Email = user.Email,
                Token = jwtService.GenerateToken(user),
                ExpireOn = DateTime.UtcNow.AddDays(1)
            };

        }
    }
}
