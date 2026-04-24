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
        public Attendee? GetAttendeeWithInterests(int attendeeId)
        {
            return _context.Set<Attendee>()
                           .Include(a => a.AttendeeInterestesWithAttendee)
                           .ThenInclude(j => j.AttendeeInterest)
                           .FirstOrDefault(a => a.Id == attendeeId);
        }
        public List<int> GetValidInterestIds(List<int> requestedIds)
        {
            requestedIds ??= new List<int>();
            return _context.Set<AttendeeInterest>()
                           .Where(i => requestedIds.Contains(i.InterestId))
                           .Select(i => i.InterestId)
                           .ToList();
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
        public void SaveChanges()
        {
            _context.SaveChanges();
        }

        // ✏️ Modified: Added implementation to get all interests
        public List<AttendeeInterest> GetAllInterests()
        {
            return _context.Set<AttendeeInterest>()
                           .Where(i => !i.IsDeleted)
                           .ToList();
        }
    }
}
