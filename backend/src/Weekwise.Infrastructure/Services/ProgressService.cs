using AutoMapper;
using Weekwise.Core.DTOs.Progress;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Infrastructure.Services;

public class ProgressService : IProgressService
{
    private readonly IProgressUpdateRepository _repo;
    private readonly IWorkCommitmentRepository _commitmentRepo;
    private readonly IWeeklyPlanRepository _planRepo;
    private readonly IMapper _mapper;

    public ProgressService(
        IProgressUpdateRepository repo,
        IWorkCommitmentRepository commitmentRepo,
        IWeeklyPlanRepository planRepo,
        IMapper mapper)
    {
        _repo = repo;
        _commitmentRepo = commitmentRepo;
        _planRepo = planRepo;
        _mapper = mapper;
    }

    public async Task<ProgressUpdateDto> UpdateProgressAsync(Guid commitmentId, UpdateProgressDto dto)
    {
        var commitment = await _commitmentRepo.GetByIdAsync(commitmentId)
            ?? throw new KeyNotFoundException($"Work commitment with ID {commitmentId} not found.");

        var plan = await _planRepo.GetByIdAsync(commitment.WeeklyPlanId)
            ?? throw new InvalidOperationException("Weekly plan associated with this commitment not found.");

        // Business Rule: Can only update progress on FROZEN plans
        if (plan.Status != PlanStatus.Frozen)
            throw new InvalidOperationException("Progress can only be updated for plans in 'Frozen' status.");

        // Action: Create append-only update
        var update = new ProgressUpdate
        {
            Id = Guid.NewGuid(),
            WorkCommitmentId = commitmentId,
            HoursCompleted = dto.HoursCompleted,
            Status = dto.Status,
            Notes = dto.Notes,
            UpdatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(update);
        return _mapper.Map<ProgressUpdateDto>(update);
    }

    public async Task<IEnumerable<ProgressUpdateDto>> GetHistoryAsync(Guid commitmentId)
    {
        var updates = await _repo.GetByCommitmentAsync(commitmentId);
        return _mapper.Map<IEnumerable<ProgressUpdateDto>>(updates);
    }

    public async Task<ProgressUpdateDto?> GetLatestAsync(Guid commitmentId)
    {
        var update = await _repo.GetLatestByCommitmentAsync(commitmentId);
        return update == null ? null : _mapper.Map<ProgressUpdateDto>(update);
    }
}
