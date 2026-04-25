using Domain.Interfaces;
using Infrastructure.Data.DbContexts;

namespace Infrastructure.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ForsaDbContext _context;

        public UnitOfWork(ForsaDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
