using Domain.Common.Interfaces;

namespace Domain.Interfaces
{
    // ✏️ Modified: Updated constraint to IEntity<int> to be consistent with IGenericRepository
    public interface IQueryableRepository<T> : IGenericRepository<T> where T : IEntity<int>
    {
        IQueryable<T> GetQueryable();
    }
}
