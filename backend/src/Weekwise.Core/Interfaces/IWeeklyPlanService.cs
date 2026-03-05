using Weekwise.Core.DTOs.WeeklyPlan;

namespace Weekwise.Core.Interfaces;

public interface IWeeklyPlanService
{
    Task<WeeklyPlanDto?> GetActivePlanAsync();
    Task<WeeklyPlanDto> CreatePlanAsync();
    Task<WeeklyPlanDto> SetupPlanAsync(SetupWeeklyPlanDto dto);
    Task CancelPlanAsync();
}
