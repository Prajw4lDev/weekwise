using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.DTOs.BacklogItem;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BacklogController : ControllerBase
{
    private readonly IBacklogItemService _service;

    public BacklogController(IBacklogItemService service)
    {
        _service = service;
    }

    /// <summary>Get all active backlog items, optionally filtered by category.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BacklogItemDto>>> GetActive([FromQuery] ItemCategory? category)
    {
        var items = await _service.GetActiveItemsAsync(category);
        return Ok(items);
    }

    /// <summary>Get a backlog item by ID.</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BacklogItemDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>Add a new backlog item.</summary>
    [HttpPost]
    public async Task<ActionResult<BacklogItemDto>> Create([FromBody] CreateBacklogItemDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Update a backlog item.</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<BacklogItemDto>> Update(Guid id, [FromBody] UpdateBacklogItemDto dto)
    {
        try
        {
            var item = await _service.UpdateAsync(id, dto);
            return Ok(item);
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

    /// <summary>Archive a backlog item (soft delete).</summary>
    [HttpPatch("{id}/archive")]
    public async Task<ActionResult<BacklogItemDto>> Archive(Guid id)
    {
        try
        {
            var item = await _service.ArchiveAsync(id);
            return Ok(item);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>Delete a backlog item (hard delete).</summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
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
}
