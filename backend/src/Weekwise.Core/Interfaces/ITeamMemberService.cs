using Weekwise.Core.DTOs.TeamMember;

namespace Weekwise.Core.Interfaces;

public interface ITeamMemberService
{
    Task<IEnumerable<TeamMemberDto>> GetAllAsync();
    Task<TeamMemberDto?> GetByIdAsync(Guid id);
    Task<TeamMemberDto> CreateAsync(CreateTeamMemberDto dto);
    Task<TeamMemberDto> UpdateAsync(Guid id, UpdateTeamMemberDto dto);
    Task DeleteAsync(Guid id);
    Task<TeamMemberDto> SetLeadAsync(Guid id);
}
