using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.Auth
{
    public interface IJwtService
    {
        string GenerateToken(ApplicationUser appUser, IList<string> roles);
    }
}
