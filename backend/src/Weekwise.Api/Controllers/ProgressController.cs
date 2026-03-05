using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.DTOs.Progress;
using Weekwise.Core.Interfaces;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _service;

    public ProgressController(IProgressService service)
    {
        _service = service;
    }

    /// <summary>Update progress for a work commitment.</summary>
    [HttpPost("{commitmentId}")]
    public async Task<ActionResult<ProgressUpdateDto>> UpdateProgress(Guid commitmentId, [FromBody] UpdateProgressDto dto)
    {
        try
        {
            var result = await _service.UpdateProgressAsync(commitmentId, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Get progress history for a work commitment.</summary>
    [HttpGet("{commitmentId}/history")]
    public async Task<ActionResult<IEnumerable<ProgressUpdateDto>>> GetHistory(Guid commitmentId)
    {
        var history = await _service.GetHistoryAsync(commitmentId);
        return Ok(history);
    }

    /// <summary>Get latest progress for a work commitment.</summary>
    [HttpGet("{commitmentId}/latest")]
    public async Task<ActionResult<ProgressUpdateDto>> GetLatest(Guid commitmentId)
    {
        var latest = await _service.GetLatestAsync(commitmentId);
        if (latest == null) return NotFound(new { message = "No progress updates found for this commitment." });
        return Ok(latest);
    }
}
