using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Infrastructure.Repositories;

public class WorkCommitmentRepository : Repository<WorkCommitment>, IWorkCommitmentRepository
{
    public WorkCommitmentRepository(WeekwiseDbContext context) : base(context) { }

    public async Task<IEnumerable<WorkCommitment>> GetByPlanAsync(Guid weeklyPlanId)
        => await _dbSet
            .Include(c => c.Member)
            .Include(c => c.BacklogItem)
            .Include(c => c.ProgressUpdates)
            .Where(c => c.WeeklyPlanId == weeklyPlanId)
            .ToListAsync();

    public async Task<IEnumerable<WorkCommitment>> GetByMemberAsync(Guid memberId, Guid weeklyPlanId)
        => await _dbSet
            .Include(c => c.BacklogItem)
            .Include(c => c.ProgressUpdates)
            .Where(c => c.MemberId == memberId && c.WeeklyPlanId == weeklyPlanId)
            .ToListAsync();

    public async Task<WorkCommitment?> GetWithDetailsAsync(Guid commitmentId)
        => await _dbSet
            .Include(c => c.Member)
            .Include(c => c.BacklogItem)
            .Include(c => c.ProgressUpdates)
            .FirstOrDefaultAsync(c => c.Id == commitmentId);
}
