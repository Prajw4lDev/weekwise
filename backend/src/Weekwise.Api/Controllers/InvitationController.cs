using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.DTOs.Invitation;
using Weekwise.Core.Interfaces;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvitationController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InvitationDto>> CreateInvitation(CreateInvitationDto dto)
    {
        try
        {
            var result = await _invitationService.CreateInvitationAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<InvitationDto>>> GetAllInvitations()
    {
        var result = await _invitationService.GetAllInvitationsAsync();
        return Ok(result);
    }

    [HttpGet("validate/{token}")]
    public async Task<ActionResult<bool>> ValidateToken(string token)
    {
        var isValid = await _invitationService.ValidateTokenAsync(token);
        return Ok(isValid);
    }

    [HttpGet("{token}")]
    public async Task<ActionResult<InvitationDto>> GetByToken(string token)
    {
        var invitation = await _invitationService.GetInvitationByTokenAsync(token);
        if (invitation == null) return NotFound("Invitation not found.");
        return Ok(invitation);
    }
}
