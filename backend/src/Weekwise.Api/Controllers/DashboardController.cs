using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.DTOs.Dashboard;
using Weekwise.Core.Interfaces;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    /// <summary>Get overall progress and task counts for the active plan.</summary>
    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverviewDto>> GetOverview()
    {
        try
        {
            var overview = await _service.GetOverviewAsync();
            return Ok(overview);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Get progress breakdown by category (Client, Tech Debt, R&D).</summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<DashboardCategoryDto>>> GetCategories()
    {
        try
        {
            var breakdown = await _service.GetCategoryBreakdownAsync();
            return Ok(breakdown);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Get progress summary for each member in the active plan.</summary>
    [HttpGet("members")]
    public async Task<ActionResult<IEnumerable<DashboardMemberDto>>> GetMembers()
    {
        try
        {
            var summary = await _service.GetMemberProgressAsync();
            return Ok(summary);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
