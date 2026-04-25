using Domain.Entities;
using Domain.Entities.AttendeeEntities;
using Domain.Interfaces.AttendeeInterfaces;
using Infrastructure.Data.DbContexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.AttendeeRepos
{
    public class AttendeeProfileRepository : IAttendeeProfileRepository
    {
        private readonly ForsaDbContext _context;
        public AttendeeProfileRepository(ForsaDbContext context)
        {
            _context = context;
        }
        public async Task<Attendee?> GetAttendeeWithInterestsAsync(int attendeeId)
        {
            return await _context.Set<Attendee>()
                           .Include(a => a.AttendeeInterestesWithAttendee)
                           .ThenInclude(j => j.AttendeeInterest)
                           .FirstOrDefaultAsync(a => a.Id == attendeeId);
        }
        public async Task<List<int>> GetValidInterestIdsAsync(List<int> requestedIds)
        {
            requestedIds ??= new List<int>();
            return await _context.Set<AttendeeInterest>()
                           .Where(i => requestedIds.Contains(i.Id))
                           .Select(i => i.Id)
                           .ToListAsync();
        }
        public void UpdateAttendeeInterests(Attendee attendee, List<int> validInterestIds)
        {
            _context.Set<AttendeeInterestesWithAttendee>()
                    .RemoveRange(attendee.AttendeeInterestesWithAttendee);
            var links = validInterestIds.Select(id => new AttendeeInterestesWithAttendee
            {
                AttendeeId = attendee.Id,
                AttendeeInterestId = id
            });
            _context.Set<AttendeeInterestesWithAttendee>().AddRange(links);
        }

        public async Task<List<AttendeeInterest>> GetAllInterestsAsync()
        {
            return await _context.Set<AttendeeInterest>()
                           .Where(i => !i.IsDeleted)
                           .ToListAsync();
        }
    }
}
