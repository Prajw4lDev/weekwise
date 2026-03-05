using Weekwise.Core.DTOs.Dashboard;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly IWeeklyPlanRepository _planRepo;
    private readonly IWorkCommitmentRepository _commitmentRepo;
    private readonly IProgressUpdateRepository _progressRepo;

    public DashboardService(
        IWeeklyPlanRepository planRepo,
        IWorkCommitmentRepository commitmentRepo,
        IProgressUpdateRepository progressRepo)
    {
        _planRepo = planRepo;
        _commitmentRepo = commitmentRepo;
        _progressRepo = progressRepo;
    }

    public async Task<DashboardOverviewDto> GetOverviewAsync()
    {
        var plan = await _planRepo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found.");

        var commitments = await _commitmentRepo.GetByPlanAsync(plan.Id);
        
        int totalTasks = commitments.Count();
        int completedTasks = 0;
        int blockedTasks = 0;
        double totalCompletedHours = 0;
        double totalCommittedHours = commitments.Sum(c => c.CommittedHours);

        foreach (var commitment in commitments)
        {
            var latestUpdate = await _progressRepo.GetLatestByCommitmentAsync(commitment.Id);
            if (latestUpdate != null)
            {
                totalCompletedHours += latestUpdate.HoursCompleted;
                if (latestUpdate.Status == TaskItemStatus.Done)
                {
                    completedTasks++;
                }
                else if (latestUpdate.Status == TaskItemStatus.Blocked)
                {
                    blockedTasks++;
                }
            }
        }

        return new DashboardOverviewDto
        {
            OverallProgressPercentage = totalCommittedHours > 0 ? (totalCompletedHours / totalCommittedHours) * 100 : 0,
            TotalTasksCount = totalTasks,
            CompletedTasksCount = completedTasks,
            BlockedTasksCount = blockedTasks
        };
    }

    public async Task<IEnumerable<DashboardCategoryDto>> GetCategoryBreakdownAsync()
    {
        var plan = await _planRepo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found.");

        var commitments = await _commitmentRepo.GetByPlanAsync(plan.Id);
        var result = new List<DashboardCategoryDto>();

        foreach (ItemCategory category in Enum.GetValues(typeof(ItemCategory)))
        {
            int percent = category switch
            {
                ItemCategory.Client => plan.ClientPercent,
                ItemCategory.TechDebt => plan.TechDebtPercent,
                ItemCategory.RnD => plan.RndPercent,
                _ => 0
            };

            double budgetHours = plan.TotalHours * (percent / 100.0);
            var categoryCommitments = commitments.Where(c => c.BacklogItem?.Category == category);
            double committedHours = categoryCommitments.Sum(c => c.CommittedHours);
            double completedHours = 0;

            foreach (var commitment in categoryCommitments)
            {
                var latestUpdate = await _progressRepo.GetLatestByCommitmentAsync(commitment.Id);
                if (latestUpdate != null)
                {
                    completedHours += latestUpdate.HoursCompleted;
                }
            }

            result.Add(new DashboardCategoryDto
            {
                Category = category,
                BudgetHours = budgetHours,
                CommittedHours = committedHours,
                CompletedHours = completedHours
            });
        }

        return result;
    }

    public async Task<IEnumerable<DashboardMemberDto>> GetMemberProgressAsync()
    {
        var plan = await _planRepo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found.");

        var result = new List<DashboardMemberDto>();

        foreach (var pm in plan.PlanMembers)
        {
            var memberCommitments = await _commitmentRepo.GetByMemberAsync(pm.MemberId, plan.Id);
            double committedHours = memberCommitments.Sum(c => c.CommittedHours);
            double completedHours = 0;

            foreach (var commitment in memberCommitments)
            {
                var latestUpdate = await _progressRepo.GetLatestByCommitmentAsync(commitment.Id);
                if (latestUpdate != null)
                {
                    completedHours += latestUpdate.HoursCompleted;
                }
            }

            result.Add(new DashboardMemberDto
            {
                MemberId = pm.MemberId,
                Name = pm.Member?.Name ?? "Unknown",
                TotalCommittedHours = committedHours,
                TotalCompletedHours = completedHours
            });
        }

        return result;
    }
}
