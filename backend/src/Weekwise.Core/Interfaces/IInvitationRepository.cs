using Weekwise.Core.Entities;

namespace Weekwise.Core.Interfaces;

public interface IInvitationRepository : IRepository<Invitation>
{
    Task<Invitation?> GetByTokenAsync(string token);
    Task<Invitation?> GetByEmailAsync(string email);
    Task<IEnumerable<Invitation>> GetPendingInvitationsAsync();
}
