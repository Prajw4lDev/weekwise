using System.ComponentModel.DataAnnotations;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Entities;

/// <summary>
/// A weekly planning cycle. Created by the Lead, progresses through
/// Setup → Planning → Frozen → Completed/Cancelled.
/// </summary>
public class WeeklyPlan
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>The date the plan was created (typically a Tuesday).</summary>
    [Required]
    public DateTime WeekStartDate { get; set; }

    [Required]
    public PlanStatus Status { get; set; } = PlanStatus.Setup;

    /// <summary>Percentage of total hours allocated to Client work.</summary>
    [Range(0, 100)]
    public int ClientPercent { get; set; }

    /// <summary>Percentage of total hours allocated to Tech Debt.</summary>
    [Range(0, 100)]
    public int TechDebtPercent { get; set; }

    /// <summary>Percentage of total hours allocated to R&D.</summary>
    [Range(0, 100)]
    public int RndPercent { get; set; }

    /// <summary>Total planned hours = selectedMembers.Count × 30.</summary>
    public double TotalHours { get; set; }

    // Navigation properties
    public ICollection<PlanMember> PlanMembers { get; set; } = new List<PlanMember>();
    public ICollection<WorkCommitment> WorkCommitments { get; set; } = new List<WorkCommitment>();
}
