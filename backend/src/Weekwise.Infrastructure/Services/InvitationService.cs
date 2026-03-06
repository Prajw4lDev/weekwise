using AutoMapper;
using Weekwise.Core.DTOs.Invitation;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Infrastructure.Services;

public class InvitationService : IInvitationService
{
    private readonly IInvitationRepository _invitationRepo;
    private readonly IMapper _mapper;

    public InvitationService(IInvitationRepository invitationRepo, IMapper mapper)
    {
        _invitationRepo = invitationRepo;
        _mapper = mapper;
    }

    public async Task<InvitationDto> CreateInvitationAsync(CreateInvitationDto dto)
    {
        // Check if there's already a pending invitation for this email
        var existing = await _invitationRepo.GetByEmailAsync(dto.Email);
        if (existing != null && existing.Status == InvitationStatus.Pending)
        {
            return _mapper.Map<InvitationDto>(existing);
        }

        var invitation = new Invitation
        {
            Email = dto.Email,
            Role = dto.Role,
            Token = Guid.NewGuid().ToString("N"),
            Status = InvitationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _invitationRepo.AddAsync(invitation);
        return _mapper.Map<InvitationDto>(invitation);
    }

    public async Task<InvitationDto?> GetInvitationByTokenAsync(string token)
    {
        var invitation = await _invitationRepo.GetByTokenAsync(token);
        return invitation == null ? null : _mapper.Map<InvitationDto>(invitation);
    }

    public async Task<IEnumerable<InvitationDto>> GetAllInvitationsAsync()
    {
        var invitations = await _invitationRepo.GetAllAsync();
        return _mapper.Map<IEnumerable<InvitationDto>>(invitations);
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        var invitation = await _invitationRepo.GetByTokenAsync(token);
        return invitation != null && invitation.Status == InvitationStatus.Pending;
    }
}
