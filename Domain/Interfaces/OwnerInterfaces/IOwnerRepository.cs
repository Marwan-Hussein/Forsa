using Domain.Entities.OwnerEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.OwnerInterfaces
{
    public interface IOwnerRepository : IQueryableRepository<Owner>
    {
            
    }
}
