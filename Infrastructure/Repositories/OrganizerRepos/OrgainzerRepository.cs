using Domain.Entities.OrganizerEntities;
using Domain.Interfaces.OrganizerInterfaces;
using Infrastructure.Data.DbContexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.OrganizerRepos
{
    public class OrgainzerRepository : QueryableRepository<Organizer> , IOrganizerRepository
    {
        public OrgainzerRepository(ForsaDbContext context):base(context)
        {
            
        }
    }
}
