using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data.DbContexts;

namespace Infrastructure.Repositories
{
    public class FeedbackRepository : QueryableRepository<Feedback>, IFeedbackRepository
    {
        public FeedbackRepository(ForsaDbContext context) : base(context) { }
    }
}
