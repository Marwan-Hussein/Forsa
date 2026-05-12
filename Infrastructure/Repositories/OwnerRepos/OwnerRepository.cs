using Domain.Entities.OwnerEntities;
using Domain.Interfaces.OwnerInterfaces;
using Infrastructure.Data.DbContexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.OwnerRepos
{
    public class OwnerRepository : QueryableRepository<Owner> , IOwnerRepository  
    {
            public OwnerRepository(ForsaDbContext context) : base(context)
            {
            }
    }
}
