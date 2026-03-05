using Weekwise.Core.Entities;

namespace Weekwise.Core.Interfaces;

public interface IWorkCommitmentRepository : IRepository<WorkCommitment>
{
    Task<IEnumerable<WorkCommitment>> GetByPlanAsync(Guid weeklyPlanId);
    Task<IEnumerable<WorkCommitment>> GetByMemberAsync(Guid memberId, Guid weeklyPlanId);
    Task<WorkCommitment?> GetWithDetailsAsync(Guid commitmentId);
}
