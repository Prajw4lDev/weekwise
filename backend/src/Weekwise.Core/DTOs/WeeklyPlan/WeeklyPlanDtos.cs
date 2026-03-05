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
