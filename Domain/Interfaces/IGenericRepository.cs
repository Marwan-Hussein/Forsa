using Domain.Common.Interfaces;

namespace Domain.Interfaces
{
    public interface IGenericRepository<T> where T : IEntity<int>
    {
        IEnumerable<T> GetAll();
        T? GetById(int id);
        void Add(T entity);
        void Update(T entity);
        void Delete(int id);
    }
}
