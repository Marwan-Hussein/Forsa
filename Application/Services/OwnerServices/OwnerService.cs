using Application.Core.DTOs.Organizer;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;
using Domain.Interfaces.OrganizerInterfaces;
using Domain.Interfaces.OwnerInterfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OwnerServices
{
    public class OwnerService
    {
        private readonly IOwnerRepository _ownerrepo;
        public OwnerService(IOwnerRepository ownerrepo)
        {
            _ownerrepo = ownerrepo;
        }
        public async Task<List<Owner>> FilterOwners(OrganizerSearchParameters searchParameter)
        {
            var result = _ownerrepo.GetQueryable();
            // Filter By Full Name
            if (!string.IsNullOrWhiteSpace(searchParameter.FullName))
            {
                result = _ownerrepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.FullName));
            }

            // Filter By Username
            if (!string.IsNullOrWhiteSpace(searchParameter.UserName))
            {
                result = _ownerrepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.UserName));
            }

            // Filter By Email
            if (!string.IsNullOrWhiteSpace(searchParameter.Email))
            {
                result = _ownerrepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.Email));
            }

            // Filter By Location
            if (!string.IsNullOrWhiteSpace(searchParameter.Location))
            {
                result = _ownerrepo.GetQueryable()
                               .Where(o => o.FullName
                               .Contains(searchParameter.Location));
            }
            //if (!string.IsNullOrWhiteSpace(searchParameter.OrganizationName))
            //{
            //    result = _ownerrepo.GetQueryable()
            //                   .Where(o => o.OrganizationName
            //                   .Contains(searchParameter.OrganizationName));
            //}

            // Sorting
            result = searchParameter.IsDescending ? result.OrderByDescending(o => o.FullName) : result.OrderBy(o => o.FullName);

            return await result.ToListAsync();
        }
    }
}
