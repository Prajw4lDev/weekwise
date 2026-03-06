using Microsoft.AspNetCore.Mvc;
using Weekwise.Core.DTOs.Auth;
using Weekwise.Core.DTOs.Invitation;
using Weekwise.Core.Interfaces;

namespace Weekwise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ITeamMemberService _authService;

    public AuthController(ITeamMemberService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null)
        {
            return Unauthorized("Invalid email or password.");
        }
        return Ok(result);
    }

    [HttpPost("register-invite")]
    public async Task<ActionResult<AuthResponseDto>> RegisterWithInvite(AcceptInviteDto dto)
    {
        try
        {
            var result = await _authService.RegisterWithInvitationAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
