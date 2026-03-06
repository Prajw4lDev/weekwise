using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Weekwise.Core.DTOs.TeamMember;
using Weekwise.Core.DTOs.Auth;
using Weekwise.Core.DTOs.Invitation;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using BCrypt.Net;

namespace Weekwise.Infrastructure.Services;

public class TeamMemberService : ITeamMemberService
{
    private readonly ITeamMemberRepository _repo;
    private readonly IWorkCommitmentRepository _commitmentRepo;
    private readonly IInvitationRepository _invitationRepo;
    private readonly IMapper _mapper;
    private readonly IJwtService _jwtService;

    public TeamMemberService(
        ITeamMemberRepository repo,
        IWorkCommitmentRepository commitmentRepo,
        IInvitationRepository invitationRepo,
        IMapper mapper,
        IJwtService jwtService)
    {
        _repo = repo;
        _commitmentRepo = commitmentRepo;
        _invitationRepo = invitationRepo;
        _mapper = mapper;
        _jwtService = jwtService;
    }

    public async Task<IEnumerable<TeamMemberDto>> GetAllAsync()
    {
        var members = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<TeamMemberDto>>(members);
    }

    public async Task<TeamMemberDto?> GetByIdAsync(Guid id)
    {
        var member = await _repo.GetByIdAsync(id);
        return member == null ? null : _mapper.Map<TeamMemberDto>(member);
    }

    public async Task<TeamMemberDto> CreateAsync(CreateTeamMemberDto dto)
    {
        var member = _mapper.Map<TeamMember>(dto);
        member.Id = Guid.NewGuid();
        member.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        member.Email = dto.Email;
        member.Role = dto.Role;
        member.WeeklyCapacityHours = dto.WeeklyCapacityHours;

        // Business rule: first member auto-becomes Lead
        var allMembers = await _repo.GetAllAsync();
        if (!allMembers.Any())
        {
            member.Role = "Admin";
        }

        await _repo.AddAsync(member);
        return _mapper.Map<TeamMemberDto>(member);
    }

    public async Task<TeamMemberDto> UpdateAsync(Guid id, UpdateTeamMemberDto dto)
    {
        var member = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Team member with ID {id} not found.");

        // Business rule: Cannot demote the only Lead
        if (member.Role == "Admin" && dto.Role == "Member")
        {
            var leads = (await _repo.GetActiveMembersAsync())
                .Count(m => m.Role == "Admin");
            if (leads <= 1)
                throw new InvalidOperationException("Cannot demote the only Lead. Promote another member first.");
        }

        member.Name = dto.Name;
        member.Role = dto.Role;
        member.Email = dto.Email;
        member.IsActive = dto.IsActive;
        member.WeeklyCapacityHours = dto.WeeklyCapacityHours;

        await _repo.UpdateAsync(member);
        return _mapper.Map<TeamMemberDto>(member);
    }

    public async Task DeleteAsync(Guid id)
    {
        var member = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Team member with ID {id} not found.");

        // Business rule: Cannot delete a member who has active commitments
        var commitments = await _commitmentRepo.FindAsync(c => c.MemberId == id);
        if (commitments.Any())
            throw new InvalidOperationException("Cannot delete a member who has active work commitments.");

        // Business rule: Cannot delete the only Lead
        if (member.Role == "Admin")
        {
            var leads = (await _repo.GetActiveMembersAsync())
                .Count(m => m.Role == "Admin");
            if (leads <= 1)
                throw new InvalidOperationException("Cannot delete the only Lead.");
        }

        await _repo.DeleteAsync(member);
    }

    public async Task<TeamMemberDto> SetLeadAsync(Guid id)
    {
        var member = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Team member with ID {id} not found.");

        // Demote all existing admins to Member
        var currentLeads = (await _repo.GetActiveMembersAsync())
            .Where(m => m.Role == "Admin");

        foreach (var lead in currentLeads)
        {
            lead.Role = "Member";
            await _repo.UpdateAsync(lead);
        }

        // Promote the selected member to Admin
        member.Role = "Admin";
        await _repo.UpdateAsync(member);

        return _mapper.Map<TeamMemberDto>(member);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var members = await _repo.GetAllAsync();
        var member = members.FirstOrDefault(m => m.Email.Equals(dto.Email, StringComparison.OrdinalIgnoreCase));
        
        if (member == null || !member.IsActive) return null;

        if (BCrypt.Net.BCrypt.Verify(dto.Password, member.PasswordHash))
        {
            return new AuthResponseDto
            {
                Token = _jwtService.GenerateToken(member),
                Name = member.Name,
                Email = member.Email,
                Role = member.Role
            };
        }

        return null;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var allMembers = await _repo.GetAllAsync();
        if (allMembers.Any(m => m.Email.Equals(dto.Email, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        // Business rule: first user is Admin, otherwise use requested role
        string assignedRole = !allMembers.Any() ? "Admin" : dto.Role;

        var member = new TeamMember
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = assignedRole,
            IsActive = true,
            WeeklyCapacityHours = 40 // Default
        };

        await _repo.AddAsync(member);

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(member),
            Name = member.Name,
            Email = member.Email,
            Role = member.Role
        };
    }

    public async Task<AuthResponseDto> RegisterWithInvitationAsync(AcceptInviteDto dto)
    {
        var invitation = await _invitationRepo.GetByTokenAsync(dto.Token)
            ?? throw new InvalidOperationException("Invalid invitation token.");

        if (invitation.Status != InvitationStatus.Pending)
            throw new InvalidOperationException("This invitation has already been used or expired.");

        var existingMember = (await _repo.GetAllAsync())
            .FirstOrDefault(m => m.Email.Equals(invitation.Email, StringComparison.OrdinalIgnoreCase));
        
        if (existingMember != null)
            throw new InvalidOperationException("User with this email already exists.");

        var member = new TeamMember
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = invitation.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = invitation.Role,
            IsActive = true,
            WeeklyCapacityHours = 40
        };

        await _repo.AddAsync(member);

        invitation.Status = InvitationStatus.Accepted;
        invitation.AcceptedAt = DateTime.UtcNow;
        await _invitationRepo.UpdateAsync(invitation);

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(member),
            Name = member.Name,
            Email = member.Email,
            Role = member.Role
        };
    }
}
