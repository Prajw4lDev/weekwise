using Weekwise.Core.Enums;

namespace Weekwise.Core.DTOs.TeamMember;

public class CreateTeamMemberDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
    public string Password { get; set; } = string.Empty;
    public int WeeklyCapacityHours { get; set; }
}

public class UpdateTeamMemberDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
    public bool IsActive { get; set; }
    public int WeeklyCapacityHours { get; set; }
}

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
    public bool IsActive { get; set; }
    public int WeeklyCapacityHours { get; set; }
}
