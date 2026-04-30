using Application.Core.DTOs.Auth;
using Application.Core.Interfaces.Auth;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Auth
{
    public class AuthService(IMapper mapper , UserManager<ApplicationUser> userManager, IJwtService jwtService) : IAuthService
    {
        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            var emailExist = await userManager.FindByEmailAsync(registerDto.Email);
            if (emailExist != null)
            {
                throw new Exception("Email already exists");
            }

            var user = mapper.Map<ApplicationUser>(registerDto);

            var result = await userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
            }
            var token = jwtService.GenerateToken(user);

            return new UserDto
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                ExpireOn = DateTime.UtcNow.AddDays(7)   
            };
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                throw new Exception("Invalid email or password.");

            var passwordValid = await userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid)
                throw new Exception("Invalid email or password.");

            var token = jwtService.GenerateToken(user);
            return new UserDto
            {
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                ExpireOn = DateTime.UtcNow.AddDays(7)
            };
        }

    }
}
