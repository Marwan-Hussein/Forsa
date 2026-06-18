using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;

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

        public async Task DeletePromoCode(int eventId, string Code)
        {
            var normalizedCode = Code.Trim().ToUpper();

            await _context.Set<PromoCode>()
                .Where(p => p.EventId == eventId && p.Code == normalizedCode)
                .ExecuteDeleteAsync();
        }
    }
}
