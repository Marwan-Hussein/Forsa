using Domain.Common.Interfaces;

namespace Domain.Interfaces
{
    public interface IGenericRepository<T> where T : IEntity<int>
    {
        Task<List<T>> GetAllAsync();
        Task<T?> GetByIdAsync(int id);
        Task AddAsync(T entity);
        void Update(T entity);
        Task DeleteAsync(int id);
    }
}
