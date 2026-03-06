using System.ComponentModel.DataAnnotations;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Entities;

/// <summary>
/// A member of the team who participates in weekly planning.
/// </summary>
public class TeamMember
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Member";

    public bool IsActive { get; set; } = true;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public int WeeklyCapacityHours { get; set; }

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<PlanMember> PlanMemberships { get; set; } = new List<PlanMember>();
    public ICollection<WorkCommitment> WorkCommitments { get; set; } = new List<WorkCommitment>();
}
