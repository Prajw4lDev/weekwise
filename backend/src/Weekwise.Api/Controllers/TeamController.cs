using Weekwise.Core.DTOs.TeamMember;
using Weekwise.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamController : ControllerBase
{
    private readonly ITeamMemberService _service;

    public TeamController(ITeamMemberService service)
    {
        _service = service;
    }

    /// <summary>Get all team members.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetAll()
    {
        var members = await _service.GetAllAsync();
        return Ok(members);
    }

    /// <summary>Get a team member by ID.</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TeamMemberDto>> GetById(Guid id)
    {
        var member = await _service.GetByIdAsync(id);
        if (member == null) return NotFound();
        return Ok(member);
    }

    /// <summary>Add a new team member.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeamMemberDto>> Create([FromBody] CreateTeamMemberDto dto)
    {
        var member = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    /// <summary>Update a team member.</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeamMemberDto>> Update(Guid id, [FromBody] UpdateTeamMemberDto dto)
    {
        try
        {
            var member = await _service.UpdateAsync(id, dto);
            return Ok(member);
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

    /// <summary>Delete a team member.</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
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

    /// <summary>Set a member as Lead (demotes all other leads).</summary>
    [HttpPatch("{id}/set-lead")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeamMemberDto>> SetLead(Guid id)
    {
        try
        {
            var member = await _service.SetLeadAsync(id);
            return Ok(member);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

}
