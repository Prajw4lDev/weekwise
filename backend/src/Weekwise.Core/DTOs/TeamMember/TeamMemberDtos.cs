using Weekwise.Core.Enums;

namespace Weekwise.Core.DTOs.TeamMember;

public class CreateTeamMemberDto
{
    public string Name { get; set; } = string.Empty;
    public MemberRole Role { get; set; } = MemberRole.Member;
}

public class UpdateTeamMemberDto
{
    public string Name { get; set; } = string.Empty;
    public MemberRole Role { get; set; }
    public bool IsActive { get; set; }
}

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public MemberRole Role { get; set; }
    public bool IsActive { get; set; }
}
