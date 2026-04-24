namespace Domain.Interfaces
{
    public interface IQueryableRepository<T> : IGenericRepository<T> where T : class
    {
        IQueryable<T> GetQueryable();
    }
}
