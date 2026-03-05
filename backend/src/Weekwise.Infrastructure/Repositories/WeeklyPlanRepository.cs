using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Infrastructure.Repositories;

public class WeeklyPlanRepository : Repository<WeeklyPlan>, IWeeklyPlanRepository
{
    public WeeklyPlanRepository(WeekwiseDbContext context) : base(context) { }

    public async Task<WeeklyPlan?> GetActivePlanAsync()
        => await _dbSet
            .Include(p => p.PlanMembers).ThenInclude(pm => pm.Member)
            .Include(p => p.WorkCommitments)
            .FirstOrDefaultAsync(p =>
                p.Status != PlanStatus.Completed &&
                p.Status != PlanStatus.Cancelled);

    public async Task<WeeklyPlan?> GetPlanWithDetailsAsync(Guid planId)
        => await _dbSet
            .Include(p => p.PlanMembers).ThenInclude(pm => pm.Member)
            .Include(p => p.WorkCommitments).ThenInclude(c => c.BacklogItem)
            .Include(p => p.WorkCommitments).ThenInclude(c => c.Member)
            .Include(p => p.WorkCommitments).ThenInclude(c => c.ProgressUpdates)
            .FirstOrDefaultAsync(p => p.Id == planId);

    public async Task<IEnumerable<WeeklyPlan>> GetCompletedPlansAsync()
        => await _dbSet
            .Where(p => p.Status == PlanStatus.Completed)
            .OrderByDescending(p => p.WeekStartDate)
            .ToListAsync();
}
