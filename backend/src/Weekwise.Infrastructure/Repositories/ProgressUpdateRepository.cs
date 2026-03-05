using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Infrastructure.Repositories;

public class ProgressUpdateRepository : Repository<ProgressUpdate>, IProgressUpdateRepository
{
    public ProgressUpdateRepository(WeekwiseDbContext context) : base(context) { }

    public async Task<IEnumerable<ProgressUpdate>> GetByCommitmentAsync(Guid workCommitmentId)
        => await _dbSet
            .Where(p => p.WorkCommitmentId == workCommitmentId)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();

    public async Task<ProgressUpdate?> GetLatestByCommitmentAsync(Guid workCommitmentId)
        => await _dbSet
            .Where(p => p.WorkCommitmentId == workCommitmentId)
            .OrderByDescending(p => p.UpdatedAt)
            .FirstOrDefaultAsync();

    public async Task<IEnumerable<ProgressUpdate>> GetByMemberAsync(Guid memberId, Guid weeklyPlanId)
        => await _dbSet
            .Include(p => p.WorkCommitment)
            .Where(p => p.WorkCommitment.MemberId == memberId &&
                        p.WorkCommitment.WeeklyPlanId == weeklyPlanId)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();
}
