using Domain.Common.Interfaces;

namespace Domain.Interfaces
{
    // ✏️ Modified: Added IEntity<int> constraint, updated GetById to return nullable, removed public from methods
    public interface IGenericRepository<T> where T : IEntity<int>
    {
        IEnumerable<T> GetAll();
        T? GetById(int id);
        void Add(T entity);
        void Update(T entity);
        void Delete(int id);
    }
}
