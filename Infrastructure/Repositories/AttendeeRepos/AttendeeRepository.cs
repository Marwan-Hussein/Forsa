using Domain.Entities.AttendeeEntities;
using Domain.Interfaces.AttendeeInterfaces;
using Infrastructure.Data.DbContexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.AttendeeRepos
{
    public class AttendeeRepository : QueryableRepository<Attendee>, IAttendeeRepository
    {
        public AttendeeRepository(ForsaDbContext context) : base(context)
        {
        }
    }
}