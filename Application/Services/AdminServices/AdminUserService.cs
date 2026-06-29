using Application.Core.DTOs.CommonDTOs;
using Application.Core.Interfaces.AdminServices;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.AttendeeEntities;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;
using Domain.Entities.AdminEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Application.Services.AdminServices
{
    public class AdminUserService : IAdminUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        
        public AdminUserService(IUnitOfWork unitOfWork , UserManager<ApplicationUser> userManager , IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _mapper = mapper;
        }
        public async Task<List<ApplicationUserDTO>> GetAll(int PageNum, int size = 20)
        {
            var data = await _userManager.Users
                        .Skip((PageNum - 1) * size)
                        .Take(size)
                        .ToListAsync();

            return await MapWithRolesAsync(data);
        }
        public async Task<List<ApplicationUserDTO>> GetAllInRole(Roles roleName , int PageNum, int size = 20)
        {
            // low performance
            var paginatedUsers = await _userManager.GetUsersInRoleAsync(roleName.ToString());
            var usersCount = paginatedUsers.Count();
            var data = paginatedUsers
                        .Skip((PageNum - 1) * size)
                        .Take(size)
                        .ToList();
            return await MapWithRolesAsync(data);
        }
        public async Task<ApplicationUserDTO> GetById(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new Exception("ID not found");
            }
            var dto = _mapper.Map<ApplicationUserDTO>(user);
            var roles = await _userManager.GetRolesAsync(user);
            dto.Role = roles.FirstOrDefault() ?? "User";
            return dto;
        }
        public async Task Block(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new Exception("ID not found");
            }
            user.IsBlocked = true;
            await _unitOfWork.SaveChangesAsync();
        }
        public async Task UnBlock(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new Exception("ID not found");
            }
            user.IsBlocked = false;
            await _unitOfWork.SaveChangesAsync();
        }
        public async Task<List<ApplicationUserDTO>> GetAllBlockedUsers(int PageNum, int size = 20)
        {
            var data = await _userManager.Users
                        .Where(u => u.IsBlocked == true)
                        .Skip((PageNum - 1) * size)
                        .Take(size)
                        .ToListAsync();
            return await MapWithRolesAsync(data);
        }

        private async Task<List<ApplicationUserDTO>> MapWithRolesAsync(List<ApplicationUser> users)
        {
            var dtos = _mapper.Map<List<ApplicationUserDTO>>(users);
            for (int i = 0; i < users.Count; i++)
            {
                var roles = await _userManager.GetRolesAsync(users[i]);
                dtos[i].Role = roles.FirstOrDefault() ?? "User";
            }
            return dtos;
        }
    }
}
