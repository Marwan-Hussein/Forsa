using Application.Core.DTOs.CommonDTOs;
using Application.Core.Interfaces.AdminServices;
using AutoMapper;
using Domain.Entities;
using Domain.ENUMs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Forsa.Controllers.AdminControllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Policy = "AdminOnly")] 
    public class AdminUsersController : ControllerBase
    {
        private readonly IAdminUserService _adminService;
        private readonly IMapper _mapper;

        public AdminUsersController(IAdminUserService adminService , IMapper mapper)
        {
            _adminService = adminService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<ApplicationUserDTO>>> GetAll([FromQuery] int pageNum = 1, [FromQuery] int size = 20)
        {
            var users = await _adminService.GetAll(pageNum, size);
            return Ok(users ?? new List<ApplicationUserDTO>());
        }

        [HttpGet("role/{role}")]
        public async Task<ActionResult<List<ApplicationUserDTO>>> GetByRole(Roles role, [FromQuery] int pageNum = 1, [FromQuery] int size = 20)
        {
            var users = await _adminService.GetAllInRole(role, pageNum, size);
            return Ok(users ?? new List<ApplicationUserDTO>());
        }

        [HttpGet("blocked")]
        public async Task<ActionResult<List<ApplicationUserDTO>>> GetBlocked([FromQuery] int pageNum = 1, [FromQuery] int size = 20)
        {
            var users = await _adminService.GetAllBlockedUsers(pageNum, size);
            return Ok(users ?? new List<ApplicationUserDTO>());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApplicationUserDTO>> GetById(int id)
        {
            try
            {
                var user = await _adminService.GetById(id);
                if (user == null)
                    return NotFound();
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/block")]
        public async Task<IActionResult> BlockUser(int id)
        {
            try
            {
                await _adminService.Block(id);
                return NoContent(); 
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/unblock")]
        public async Task<IActionResult> UnBlockUser(int id)
        {
            try
            {
                await _adminService.UnBlock(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
