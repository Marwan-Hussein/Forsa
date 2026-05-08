using Application.Core.DTOs.CommonDTOs;
using Domain.Common.Interfaces;
using Domain.Entities;
using Domain.ENUMs;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.AdminServices
{
    public interface IAdminUserService
    {
        Task<List<ApplicationUserDTO>> GetAll(int PageNum, int size = 20);
        Task<List<ApplicationUserDTO>> GetAllInRole(Roles roleName , int PageNum, int size = 20);
        Task<ApplicationUserDTO> GetById(int id);
        Task Block(int id);
        Task UnBlock(int id);
        Task<List<ApplicationUserDTO>> GetAllBlockedUsers(int PageNum, int size = 20);
    }
}
