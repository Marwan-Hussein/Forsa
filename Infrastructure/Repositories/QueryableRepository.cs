using Domain.Interfaces;
using Domain.Common.Interfaces;
using Infrastructure.Data.DbContexts;

namespace Infrastructure.Repositories
{
    public class QueryableRepository<T> : GenericRepository<T>, IQueryableRepository<T>
        where T : class, IEntity<int>
    {
        public QueryableRepository(ForsaDbContext context) : base(context) { }

        public IQueryable<T> GetQueryable()
        {
            return _context.Set<T>().AsQueryable();
        }
    }
}
