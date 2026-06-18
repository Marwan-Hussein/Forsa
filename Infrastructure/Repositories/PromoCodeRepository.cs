using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PromoCodeRepository : GenericRepository<PromoCode> , IPromoCodeRepository
    {
        public PromoCodeRepository(ForsaDbContext context) : base(context){}
 
        public async Task<PromoCode?> GetByCodeAsync(int eventId, string code)
        {
            return await _context.Set<PromoCode>().FirstOrDefaultAsync(p => p.EventId == eventId && p.Code == code);
        }

        public async Task<bool> DeactivatePromoCodeAsync(int eventId,string code)
        {
            var promoCode = await GetByCodeAsync(eventId, code);
            if (promoCode == null)
            {
                return false;
            }

            promoCode.IsActive = false;

            _context.Entry(promoCode).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
