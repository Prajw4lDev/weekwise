using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.Interfaces;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    private readonly IDataService _service;

    public DataController(IDataService service)
    {
        _service = service;
    }

    /// <summary>Export all data as JSON.</summary>
    [HttpGet("export")]
    public async Task<ActionResult> Export()
    {
        var data = await _service.ExportAllAsync();
        return Ok(data);
    }

    /// <summary>Import data from JSON (replaces all existing data).</summary>
    [HttpPost("import")]
    public async Task<ActionResult> Import([FromBody] object jsonData)
    {
        try
        {
            await _service.ImportAllAsync(jsonData.ToString()!);
            return Ok(new { message = "Data imported successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Import failed: {ex.Message}" });
        }
    }

    /// <summary>Seed demo data for testing.</summary>
    [HttpPost("seed")]
    public async Task<ActionResult> Seed()
    {
        try
        {
            await _service.SeedDemoDataAsync();
            return Ok(new { message = "Demo data seeded successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Seed failed: {ex.Message}" });
        }
    }

    /// <summary>Reset all data (clear everything).</summary>
    [HttpPost("reset")]
    public async Task<ActionResult> Reset()
    {
        try
        {
            await _service.ResetAllAsync();
            return Ok(new { message = "All data has been reset." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Reset failed: {ex.Message}" });
        }
    }
}
