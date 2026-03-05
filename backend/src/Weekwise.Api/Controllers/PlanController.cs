using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.DTOs.WeeklyPlan;
using Weekwise.Core.Interfaces;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanController : ControllerBase
{
    private readonly IWeeklyPlanService _service;

    public PlanController(IWeeklyPlanService service)
    {
        _service = service;
    }

    /// <summary>Get the current active plan (if any).</summary>
    [HttpGet]
    public async Task<ActionResult<WeeklyPlanDto>> GetActive()
    {
        var plan = await _service.GetActivePlanAsync();
        if (plan == null) return NotFound(new { message = "No active plan found." });
        return Ok(plan);
    }

    /// <summary>Start a new weekly plan.</summary>
    [HttpPost]
    public async Task<ActionResult<WeeklyPlanDto>> Create()
    {
        try
        {
            var plan = await _service.CreatePlanAsync();
            return Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Setup plan members and category percentages.</summary>
    [HttpPut("setup")]
    public async Task<ActionResult<WeeklyPlanDto>> Setup([FromBody] SetupWeeklyPlanDto dto)
    {
        try
        {
            var plan = await _service.SetupPlanAsync(dto);
            return Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>Cancel the current active plan.</summary>
    [HttpPost("cancel")]
    public async Task<ActionResult> Cancel()
    {
        try
        {
            await _service.CancelPlanAsync();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
