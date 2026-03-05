using Weekwise.Core.DTOs.WorkCommitment;
using Weekwise.Core.DTOs.WeeklyPlan;

namespace Weekwise.Core.Interfaces;

public interface IWeeklyPlanService
{
    Task<WeeklyPlanDto?> GetActivePlanAsync();
    Task<WeeklyPlanDto> CreatePlanAsync();
    Task<WeeklyPlanDto> SetupPlanAsync(SetupWeeklyPlanDto dto);
    Task CancelPlanAsync();
    Task CompletePlanAsync();
    Task<IEnumerable<WeeklyPlanDto>> GetHistoryAsync();
    Task<WeeklyPlanDto?> GetPlanDetailsAsync(Guid planId);

    Task<WorkCommitmentDto> AddCommitmentAsync(CreateCommitmentDto dto);
    Task RemoveCommitmentAsync(Guid commitmentId);
    Task<IEnumerable<WorkCommitmentDto>> GetCommitmentsByMemberAsync(Guid memberId);
    Task<IEnumerable<WorkCommitmentDto>> GetActivePlanCommitmentsAsync();

    Task<PlanReviewDto> GetPlanReviewAsync();
    Task FreezePlanAsync();
}
