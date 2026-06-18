using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IPromoCodeRepository : IGenericRepository<PromoCode>
    {
        Task<PromoCode?> GetByCodeAsync(int eventId, string code);
        Task<bool> DeactivatePromoCodeAsync(int eventId , string code);
        Task DeletePromoCode(int eventId,string Code);

    }
}
