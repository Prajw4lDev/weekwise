namespace Weekwise.Core.DTOs.Invitation;

public class CreateInvitationDto
{
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
}

public class InvitationDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
    public string Token { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AcceptInviteDto
{
    public string Token { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
