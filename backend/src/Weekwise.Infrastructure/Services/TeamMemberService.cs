using AutoMapper;
using Weekwise.Core.DTOs.TeamMember;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Infrastructure.Services;

public class TeamMemberService : ITeamMemberService
{
    private readonly ITeamMemberRepository _repo;
    private readonly IWorkCommitmentRepository _commitmentRepo;
    private readonly IMapper _mapper;

    public TeamMemberService(
        ITeamMemberRepository repo,
        IWorkCommitmentRepository commitmentRepo,
        IMapper mapper)
    {
        _repo = repo;
        _commitmentRepo = commitmentRepo;
        _mapper = mapper;
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

        // Business rule: first member auto-becomes Lead
        var allMembers = await _repo.GetAllAsync();
        if (!allMembers.Any())
        {
            member.Role = MemberRole.Lead;
        }

        await _repo.AddAsync(member);
        return _mapper.Map<TeamMemberDto>(member);
    }

    public async Task<TeamMemberDto> UpdateAsync(Guid id, UpdateTeamMemberDto dto)
    {
        var member = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Team member with ID {id} not found.");

        // Business rule: Cannot demote the only Lead
        if (member.Role == MemberRole.Lead && dto.Role == MemberRole.Member)
        {
            var leads = (await _repo.GetActiveMembersAsync())
                .Count(m => m.Role == MemberRole.Lead);
            if (leads <= 1)
                throw new InvalidOperationException("Cannot demote the only Lead. Promote another member first.");
        }

        member.Name = dto.Name;
        member.Role = dto.Role;
        member.IsActive = dto.IsActive;

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
        if (member.Role == MemberRole.Lead)
        {
            var leads = (await _repo.GetActiveMembersAsync())
                .Count(m => m.Role == MemberRole.Lead);
            if (leads <= 1)
                throw new InvalidOperationException("Cannot delete the only Lead.");
        }

        await _repo.DeleteAsync(member);
    }

    public async Task<TeamMemberDto> SetLeadAsync(Guid id)
    {
        var member = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Team member with ID {id} not found.");

        // Demote all existing leads to Member
        var currentLeads = (await _repo.GetActiveMembersAsync())
            .Where(m => m.Role == MemberRole.Lead);

        foreach (var lead in currentLeads)
        {
            lead.Role = MemberRole.Member;
            await _repo.UpdateAsync(lead);
        }

        // Promote the selected member to Lead
        member.Role = MemberRole.Lead;
        await _repo.UpdateAsync(member);

        return _mapper.Map<TeamMemberDto>(member);
    }
}
