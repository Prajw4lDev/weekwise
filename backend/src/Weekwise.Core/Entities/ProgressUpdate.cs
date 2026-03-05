using System.ComponentModel.DataAnnotations;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Entities;

/// <summary>
/// A progress update on a work commitment.
/// Append-only — each POST creates a new entry to maintain history.
/// </summary>
public class ProgressUpdate
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid WorkCommitmentId { get; set; }

    /// <summary>Hours completed so far (can exceed committed = over-hours).</summary>
    [Range(0, 200)]
    public double HoursCompleted { get; set; }

    [Required]
    public TaskItemStatus Status { get; set; } = TaskItemStatus.NotStarted;

    [MaxLength(500)]
    public string Notes { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public WorkCommitment WorkCommitment { get; set; } = null!;
}
