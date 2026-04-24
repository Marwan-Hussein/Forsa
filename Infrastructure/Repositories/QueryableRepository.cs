using Domain.Interfaces;
using Infrastructure.Data.DbContexts;

namespace Infrastructure.Repositories
{
    public class QueryableRepository<T> : GenericRepository<T>, IQueryableRepository<T> where T : class
    {
        private readonly ForsaDbContext _context;

        public QueryableRepository(ForsaDbContext context) : base(context)
        {
            _context = context;
        }

        public IQueryable<T> GetQueryable()
        {
            return _context.Set<T>().AsQueryable();
        }
    }
}
