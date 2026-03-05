using System.ComponentModel.DataAnnotations;

namespace Weekwise.Core.Entities;

/// <summary>
/// A member's commitment to work on a specific backlog item during a weekly plan.
/// Created during the Planning phase (before freeze).
/// </summary>
public class WorkCommitment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid WeeklyPlanId { get; set; }

    [Required]
    public Guid MemberId { get; set; }

    [Required]
    public Guid BacklogItemId { get; set; }

    /// <summary>Hours committed to this item (max 30 per member total).</summary>
    [Range(0.5, 30)]
    public double CommittedHours { get; set; }

    // Navigation properties
    public WeeklyPlan WeeklyPlan { get; set; } = null!;
    public TeamMember Member { get; set; } = null!;
    public BacklogItem BacklogItem { get; set; } = null!;
    public ICollection<ProgressUpdate> ProgressUpdates { get; set; } = new List<ProgressUpdate>();
}
