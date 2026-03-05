using Weekwise.Core.Entities;

namespace Weekwise.Core.Interfaces;

public interface ITeamMemberRepository : IRepository<TeamMember>
{
    Task<IEnumerable<TeamMember>> GetActiveMembersAsync();
    Task<TeamMember?> GetLeadAsync();
}
