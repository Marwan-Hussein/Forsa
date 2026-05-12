using Domain.Entities.OrganizerEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.OrganizerInterfaces
{
    public interface IOrganizerRepository : IQueryableRepository<Organizer>
    {
    }
}
