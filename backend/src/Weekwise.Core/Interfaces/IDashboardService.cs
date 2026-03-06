using Weekwise.Core.DTOs.Dashboard;

namespace Weekwise.Core.Interfaces;

public interface IDashboardService
{
    Task<DashboardOverviewDto> GetOverviewAsync();
    Task<IEnumerable<DashboardCategoryDto>> GetCategoryBreakdownAsync();
    Task<IEnumerable<DashboardMemberDto>> GetMemberProgressAsync();
    Task<IEnumerable<DashboardTrendDto>> GetWeeklyTrendAsync();
}
