using System.ComponentModel.DataAnnotations;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Entities;

/// <summary>
/// A backlog work item that can be picked up and committed to during weekly planning.
/// </summary>
public class BacklogItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public ItemCategory Category { get; set; }

    [Range(0.5, 100)]
    public double EstimatedHours { get; set; }

    public bool IsArchived { get; set; } = false;

    // Navigation properties
    public ICollection<WorkCommitment> WorkCommitments { get; set; } = new List<WorkCommitment>();
}
