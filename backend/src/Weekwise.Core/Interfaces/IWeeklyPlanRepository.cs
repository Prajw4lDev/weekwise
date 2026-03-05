using Weekwise.Core.Entities;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Interfaces;

public interface IWeeklyPlanRepository : IRepository<WeeklyPlan>
{
    Task<WeeklyPlan?> GetActivePlanAsync();
    Task<WeeklyPlan?> GetPlanWithDetailsAsync(Guid planId);
    Task<IEnumerable<WeeklyPlan>> GetCompletedPlansAsync();
}
