using Weekwise.Core.Enums;

namespace Weekwise.Core.DTOs.Dashboard;

public class DashboardOverviewDto
{
    public double OverallProgressPercentage { get; set; }
    public int TotalTasksCount { get; set; }
    public int CompletedTasksCount { get; set; }
    public int BlockedTasksCount { get; set; }
}

public class DashboardCategoryDto
{
    public ItemCategory Category { get; set; }
    public double BudgetHours { get; set; }
    public double CommittedHours { get; set; }
    public double CompletedHours { get; set; }
    public double ProgressPercentage => BudgetHours > 0 ? (CompletedHours / BudgetHours) * 100 : 0;
}

public class DashboardMemberDto
{
    public Guid MemberId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double TotalCommittedHours { get; set; }
    public double TotalCompletedHours { get; set; }
    public double ProgressPercentage => TotalCommittedHours > 0 ? (TotalCompletedHours / TotalCommittedHours) * 100 : 0;
}
