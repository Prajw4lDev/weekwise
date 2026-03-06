using Weekwise.Core.DTOs.Auth;
using Weekwise.Core.DTOs.Invitation;
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
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> RegisterWithInvitationAsync(AcceptInviteDto dto);
}
