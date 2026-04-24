using Domain.Interfaces;
using Domain.Common.Interfaces;
using Infrastructure.Data.DbContexts;
using System.Collections.Generic;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class, IEntity<int>
    {
        protected readonly ForsaDbContext _context;

        public GenericRepository(ForsaDbContext context)
        {
            _context = context;
        }

        public IEnumerable<T> GetAll()
        {
            return _context.Set<T>().ToList();
        }

        // ✏️ Modified: Updated to return nullable
        public T? GetById(int id)
        {
            return _context.Set<T>().Find(id);
        }

        public void Add(T entity)
        {
            _context.Set<T>().Add(entity);
        }

        public void Update(T entity)
        {
            _context.Set<T>().Update(entity);
        }

        public void Delete(int id)
        {
            var entity = _context.Set<T>().Find(id);
            // ✏️ Modified: simplified if statement
            if (entity != null) _context.Set<T>().Remove(entity);
        }
    }
}
