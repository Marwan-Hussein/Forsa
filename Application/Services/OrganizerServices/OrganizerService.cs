using Application.Core.DTOs.Organizer;
using Domain.Entities.OrganizerEntities;
using Domain.Interfaces.OrganizerInterfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrganizerServices
{
    public class OrganizerService
    {
        private readonly IOrganizerRepository _organizerRepo;
        public OrganizerService(IOrganizerRepository organizerRepo)
        {
            _organizerRepo = organizerRepo;
        }
        public async Task<List<Organizer>> FilterOrganizers(OrganizerSearchParameters searchParameter)
        {
            var result = _organizerRepo.GetQueryable();
            // Filter By Full Name
            if (!string.IsNullOrWhiteSpace(searchParameter.FullName))
            {
                result = _organizerRepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.FullName));
            }

            // Filter By Username
            if (!string.IsNullOrWhiteSpace(searchParameter.UserName))
            {
                result = _organizerRepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.UserName));
            }

            // Filter By Email
            if (!string.IsNullOrWhiteSpace(searchParameter.Email))
            {
                result = _organizerRepo.GetQueryable()
                              .Where(o => o.FullName
                              .Contains(searchParameter.Email));
            }

            // Filter By Location
            if (!string.IsNullOrWhiteSpace(searchParameter.Location))
            {
                result = _organizerRepo.GetQueryable()
                               .Where(o => o.FullName
                               .Contains(searchParameter.Location));
            }
            if (!string.IsNullOrWhiteSpace(searchParameter.OrganizationName))
            {
                result = _organizerRepo.GetQueryable()
                               .Where(o => o.OrganizationName
                               .Contains(searchParameter.OrganizationName));
            }

            // Sorting
            result = searchParameter.IsDescending ? result.OrderByDescending(o => o.FullName): result.OrderBy(o => o.FullName);

            return await result.ToListAsync();
        }
    }
}
