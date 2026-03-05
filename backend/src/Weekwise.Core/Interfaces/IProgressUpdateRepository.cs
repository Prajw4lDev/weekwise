using Weekwise.Core.Entities;

namespace Weekwise.Core.Interfaces;

public interface IProgressUpdateRepository : IRepository<ProgressUpdate>
{
    Task<IEnumerable<ProgressUpdate>> GetByCommitmentAsync(Guid workCommitmentId);
    Task<ProgressUpdate?> GetLatestByCommitmentAsync(Guid workCommitmentId);
    Task<IEnumerable<ProgressUpdate>> GetByMemberAsync(Guid memberId, Guid weeklyPlanId);
}
