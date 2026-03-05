using Weekwise.Core.Enums;

namespace Weekwise.Core.DTOs.WeeklyPlan;

public class CreateWeeklyPlanDto
{
    // Plan is created with default Setup status and current date
}

public class SetupWeeklyPlanDto
{
    public List<Guid> MemberIds { get; set; } = new();
    public int ClientPercent { get; set; }
    public int TechDebtPercent { get; set; }
    public int RndPercent { get; set; }
}

public class WeeklyPlanDto
{
    public Guid Id { get; set; }
    public DateTime WeekStartDate { get; set; }
    public PlanStatus Status { get; set; }
    public int ClientPercent { get; set; }
    public int TechDebtPercent { get; set; }
    public int RndPercent { get; set; }
    public double TotalHours { get; set; }
    public List<Guid> SelectedMemberIds { get; set; } = new();
}

public class PlanReviewDto
{
    public Guid PlanId { get; set; }
    public PlanStatus Status { get; set; }
    public List<CategorySummaryDto> Categories { get; set; } = new();
    public List<MemberSummaryDto> Members { get; set; } = new();
    public List<string> ValidationIssues { get; set; } = new();
    public bool CanFreeze { get; set; }
}

public class CategorySummaryDto
{
    public ItemCategory Category { get; set; }
    public int BudgetPercent { get; set; }
    public double BudgetHours { get; set; }
    public double CommittedHours { get; set; }
    public double ProgressPercentage => BudgetHours > 0 ? (CommittedHours / BudgetHours) * 100 : 0;
}

public class MemberSummaryDto
{
    public Guid MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public double CommittedHours { get; set; }
    public bool IsFull => CommittedHours >= 30;
}
