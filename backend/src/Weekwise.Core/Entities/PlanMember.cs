using System.ComponentModel.DataAnnotations;

namespace Weekwise.Core.Entities;

/// <summary>
/// Junction table linking a WeeklyPlan to its selected TeamMembers.
/// </summary>
public class PlanMember
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid WeeklyPlanId { get; set; }

    [Required]
    public Guid MemberId { get; set; }

    // Navigation properties
    public WeeklyPlan WeeklyPlan { get; set; } = null!;
    public TeamMember Member { get; set; } = null!;
}
