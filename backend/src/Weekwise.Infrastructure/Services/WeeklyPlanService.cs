using AutoMapper;
using Weekwise.Core.DTOs.WeeklyPlan;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Infrastructure.Services;

public class WeeklyPlanService : IWeeklyPlanService
{
    private readonly IWeeklyPlanRepository _repo;
    private readonly ITeamMemberRepository _memberRepo;
    private readonly IMapper _mapper;

    public WeeklyPlanService(
        IWeeklyPlanRepository repo,
        ITeamMemberRepository memberRepo,
        IMapper mapper)
    {
        _repo = repo;
        _memberRepo = memberRepo;
        _mapper = mapper;
    }

    public async Task<WeeklyPlanDto?> GetActivePlanAsync()
    {
        var plan = await _repo.GetActivePlanAsync();
        return plan == null ? null : _mapper.Map<WeeklyPlanDto>(plan);
    }

    public async Task<WeeklyPlanDto> CreatePlanAsync()
    {
        // Business rule: Only ONE active plan at a time
        var activePlan = await _repo.GetActivePlanAsync();
        if (activePlan != null)
            throw new InvalidOperationException("An active plan already exists. Complete or cancel it before starting a new one.");

        var plan = new WeeklyPlan
        {
            Id = Guid.NewGuid(),
            WeekStartDate = DateTime.UtcNow.Date, // Typically a Tuesday
            Status = PlanStatus.Setup
        };

        await _repo.AddAsync(plan);
        return _mapper.Map<WeeklyPlanDto>(plan);
    }

    public async Task<WeeklyPlanDto> SetupPlanAsync(SetupWeeklyPlanDto dto)
    {
        var plan = await _repo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found to setup.");

        if (plan.Status != PlanStatus.Setup)
            throw new InvalidOperationException("Plan is already setup and in progress.");

        // Business rule: Percentages must sum to 100
        if (dto.ClientPercent + dto.TechDebtPercent + dto.RndPercent != 100)
            throw new InvalidOperationException("Category percentages must sum to exactly 100%.");

        // Business rule: At least 1 member must be selected
        if (dto.MemberIds == null || !dto.MemberIds.Any())
            throw new InvalidOperationException("At least one team member must be selected for the plan.");

        // Action: Update members
        plan.PlanMembers.Clear();
        foreach (var memberId in dto.MemberIds)
        {
            var member = await _memberRepo.GetByIdAsync(memberId)
                ?? throw new KeyNotFoundException($"Team member with ID {memberId} not found.");
            
            plan.PlanMembers.Add(new PlanMember
            {
                Id = Guid.NewGuid(),
                WeeklyPlanId = plan.Id,
                MemberId = memberId
            });
        }

        // Action: Update stats
        plan.ClientPercent = dto.ClientPercent;
        plan.TechDebtPercent = dto.TechDebtPercent;
        plan.RndPercent = dto.RndPercent;
        plan.TotalHours = dto.MemberIds.Count * 30;
        plan.Status = PlanStatus.Planning;

        await _repo.UpdateAsync(plan);
        return await GetActivePlanDtoWithDetails(plan.Id);
    }

    public async Task CancelPlanAsync()
    {
        var plan = await _repo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found to cancel.");

        plan.Status = PlanStatus.Cancelled;
        await _repo.UpdateAsync(plan);
    }

    private async Task<WeeklyPlanDto> GetActivePlanDtoWithDetails(Guid planId)
    {
        var plan = await _repo.GetPlanWithDetailsAsync(planId);
        return _mapper.Map<WeeklyPlanDto>(plan);
    }
}
