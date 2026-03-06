using System.ComponentModel.DataAnnotations;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Entities;

public class Invitation
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Member";

    [Required]
    public string Token { get; set; } = string.Empty;

    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedAt { get; set; }
}

public enum InvitationStatus
{
    Pending,
    Accepted,
    Expired
}
