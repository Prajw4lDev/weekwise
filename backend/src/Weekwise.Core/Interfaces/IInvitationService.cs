using Weekwise.Core.DTOs.Invitation;

namespace Weekwise.Core.Interfaces;

public interface IInvitationService
{
    Task<InvitationDto> CreateInvitationAsync(CreateInvitationDto dto);
    Task<InvitationDto?> GetInvitationByTokenAsync(string token);
    Task<IEnumerable<InvitationDto>> GetAllInvitationsAsync();
    Task<bool> ValidateTokenAsync(string token);
}
