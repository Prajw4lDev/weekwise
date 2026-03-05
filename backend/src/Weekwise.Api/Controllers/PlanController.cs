using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.DTOs.WeeklyPlan;
using Weekwise.Core.DTOs.WorkCommitment;
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

    // ─── COMMITMENTS ───

    /// <summary>Get all commitments for the active plan.</summary>
    [HttpGet("commitments")]
    public async Task<ActionResult<IEnumerable<WorkCommitmentDto>>> GetActiveCommitments()
    {
        var commitments = await _service.GetActivePlanCommitmentsAsync();
        return Ok(commitments);
    }

    /// <summary>Get commitments for a specific member in the active plan.</summary>
    [HttpGet("commitments/member/{memberId}")]
    public async Task<ActionResult<IEnumerable<WorkCommitmentDto>>> GetMemberCommitments(Guid memberId)
    {
        var commitments = await _service.GetCommitmentsByMemberAsync(memberId);
        return Ok(commitments);
    }

    /// <summary>Add a new work commitment.</summary>
    [HttpPost("commitments")]
    public async Task<ActionResult<WorkCommitmentDto>> AddCommitment([FromBody] CreateCommitmentDto dto)
    {
        try
        {
            var commitment = await _service.AddCommitmentAsync(dto);
            return Ok(commitment);
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

    /// <summary>Remove a work commitment.</summary>
    [HttpDelete("commitments/{id}")]
    public async Task<ActionResult> RemoveCommitment(Guid id)
    {
        try
        {
            await _service.RemoveCommitmentAsync(id);
            return NoContent();
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
}
