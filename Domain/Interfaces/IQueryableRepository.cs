using Domain.Common.Interfaces;

namespace Domain.Interfaces
{
    public interface IQueryableRepository<T> : IGenericRepository<T> where T : IEntity<int>
    {
        IQueryable<T> GetQueryable();
    }
}
