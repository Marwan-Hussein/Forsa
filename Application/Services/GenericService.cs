using Application.Core.Interfaces;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class GenericService<T> : IGenericService<T> where T : class
    {
        IGenericRepository<T> _repo;

        public GenericService(IGenericRepository<T> repo)
        {
            _repo = repo;
        }

        public IEnumerable<T> GetAll()
        {
            return _repo.GetAll();
        }

        public T GetById(int id)
        {
            return _repo.GetById(id);
        }

        public void Add(T entity)
        {
            _repo.Add(entity);
        }

        public void Update(T entity)
        {
            _repo.Update(entity);
        }

        public void Delete(int id)
        {
            _repo.Delete(id);
        } 
    }
}
