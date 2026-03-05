using AutoMapper;
using Weekwise.Core.DTOs.WeeklyPlan;
using Weekwise.Core.DTOs.WorkCommitment;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Infrastructure.Services;

public class WeeklyPlanService : IWeeklyPlanService
{
    private readonly IWeeklyPlanRepository _repo;
    private readonly ITeamMemberRepository _memberRepo;
    private readonly IBacklogItemRepository _backlogRepo;
    private readonly IWorkCommitmentRepository _commitmentRepo;
    private readonly IMapper _mapper;

    public WeeklyPlanService(
        IWeeklyPlanRepository repo,
        ITeamMemberRepository memberRepo,
        IBacklogItemRepository backlogRepo,
        IWorkCommitmentRepository commitmentRepo,
        IMapper mapper)
    {
        _repo = repo;
        _memberRepo = memberRepo;
        _backlogRepo = backlogRepo;
        _commitmentRepo = commitmentRepo;
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

    public async Task<WorkCommitmentDto> AddCommitmentAsync(CreateCommitmentDto dto)
    {
        var plan = await _repo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found.");

        if (plan.Status != PlanStatus.Planning)
            throw new InvalidOperationException("Commitments can only be added when the plan is in 'Planning' status.");

        // Validate member
        var isMemberInPlan = plan.PlanMembers.Any(pm => pm.MemberId == dto.MemberId);
        if (!isMemberInPlan)
            throw new InvalidOperationException("Member is not part of the active weekly plan.");

        // Validate backlog item
        var item = await _backlogRepo.GetByIdAsync(dto.BacklogItemId)
            ?? throw new KeyNotFoundException($"Backlog item with ID {dto.BacklogItemId} not found.");

        if (item.IsArchived)
            throw new InvalidOperationException("Cannot commit to an archived backlog item.");

        // Business Rule: Same member cannot commit same item twice in same plan
        var existing = await _commitmentRepo.FindAsync(c => 
            c.WeeklyPlanId == plan.Id && 
            c.MemberId == dto.MemberId && 
            c.BacklogItemId == dto.BacklogItemId);
        
        if (existing.Any())
            throw new InvalidOperationException("Member has already committed to this backlog item for this week.");

        // Business Rule: 30h Rule
        var memberCommitments = await _commitmentRepo.GetByMemberAsync(dto.MemberId, plan.Id);
        var totalMemberHours = memberCommitments.Sum(c => c.CommittedHours);
        if (totalMemberHours + dto.CommittedHours > 30)
            throw new InvalidOperationException($"Commitment exceeds member's 30h budget. Remaining: {30 - totalMemberHours}h.");

        // Business Rule: Category Budget Rule
        int categoryPercent = item.Category switch
        {
            ItemCategory.Client => plan.ClientPercent,
            ItemCategory.TechDebt => plan.TechDebtPercent,
            ItemCategory.RnD => plan.RndPercent,
            _ => 0
        };

        double categoryBudgetHours = plan.TotalHours * (categoryPercent / 100.0);
        var allCommitments = await _commitmentRepo.GetByPlanAsync(plan.Id);
        var currentlyClaimedForCategory = allCommitments
            .Where(c => c.BacklogItem?.Category == item.Category)
            .Sum(c => c.CommittedHours);

        if (currentlyClaimedForCategory + dto.CommittedHours > categoryBudgetHours)
            throw new InvalidOperationException($"Commitment exceeds {item.Category} budget of {categoryBudgetHours}h. Currently claimed: {currentlyClaimedForCategory}h.");

        // Action: Create commitment
        var commitment = new WorkCommitment
        {
            Id = Guid.NewGuid(),
            WeeklyPlanId = plan.Id,
            MemberId = dto.MemberId,
            BacklogItemId = dto.BacklogItemId,
            CommittedHours = dto.CommittedHours
        };

        await _commitmentRepo.AddAsync(commitment);
        
        var result = await _commitmentRepo.GetWithDetailsAsync(commitment.Id);
        return _mapper.Map<WorkCommitmentDto>(result);
    }

    public async Task RemoveCommitmentAsync(Guid commitmentId)
    {
        var plan = await _repo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found.");

        if (plan.Status != PlanStatus.Planning)
            throw new InvalidOperationException("Commitments can only be removed when the plan is in 'Planning' status.");

        var commitment = await _commitmentRepo.GetByIdAsync(commitmentId)
            ?? throw new KeyNotFoundException($"Commitment with ID {commitmentId} not found.");

        if (commitment.WeeklyPlanId != plan.Id)
            throw new InvalidOperationException("Commitment does not belong to the active plan.");

        await _commitmentRepo.DeleteAsync(commitment);
    }

    public async Task<IEnumerable<WorkCommitmentDto>> GetCommitmentsByMemberAsync(Guid memberId)
    {
        var plan = await _repo.GetActivePlanAsync();
        if (plan == null) return Enumerable.Empty<WorkCommitmentDto>();

        var commitments = await _commitmentRepo.GetByMemberAsync(memberId, plan.Id);
        return _mapper.Map<IEnumerable<WorkCommitmentDto>>(commitments);
    }

    public async Task<IEnumerable<WorkCommitmentDto>> GetActivePlanCommitmentsAsync()
    {
        var plan = await _repo.GetActivePlanAsync();
        if (plan == null) return Enumerable.Empty<WorkCommitmentDto>();

        var commitments = await _commitmentRepo.GetByPlanAsync(plan.Id);
        return _mapper.Map<IEnumerable<WorkCommitmentDto>>(commitments);
    }

    public async Task<PlanReviewDto> GetPlanReviewAsync()
    {
        var plan = await _repo.GetActivePlanAsync()
            ?? throw new InvalidOperationException("No active plan found.");

        var allCommitments = await _commitmentRepo.GetByPlanAsync(plan.Id);
        var review = new PlanReviewDto
        {
            PlanId = plan.Id,
            Status = plan.Status
        };

        // Category Summaries
        foreach (ItemCategory category in Enum.GetValues(typeof(ItemCategory)))
        {
            int percent = category switch
            {
                ItemCategory.Client => plan.ClientPercent,
                ItemCategory.TechDebt => plan.TechDebtPercent,
                ItemCategory.RnD => plan.RndPercent,
                _ => 0
            };

            double budgetHours = plan.TotalHours * (percent / 100.0);
            double committed = allCommitments
                .Where(c => c.BacklogItem?.Category == category)
                .Sum(c => c.CommittedHours);

            review.Categories.Add(new CategorySummaryDto
            {
                Category = category,
                BudgetPercent = percent,
                BudgetHours = budgetHours,
                CommittedHours = committed
            });
        }

        // Member Summaries
        foreach (var pm in plan.PlanMembers)
        {
            double committed = allCommitments
                .Where(c => c.MemberId == pm.MemberId)
                .Sum(c => c.CommittedHours);

            review.Members.Add(new MemberSummaryDto
            {
                MemberId = pm.MemberId,
                MemberName = pm.Member?.Name ?? "Unknown",
                CommittedHours = committed
            });

            if (committed < 30)
            {
                review.ValidationIssues.Add($"Member {pm.Member?.Name} has only {committed}h/30h committed.");
            }
        }

        review.CanFreeze = !review.ValidationIssues.Any() && plan.Status == PlanStatus.Planning;

        return review;
    }

    public async Task FreezePlanAsync()
    {
        var review = await GetPlanReviewAsync();
        
        if (!review.CanFreeze)
        {
            var errors = string.Join(" ", review.ValidationIssues);
            throw new InvalidOperationException($"Cannot freeze plan. {errors}");
        }

        var plan = await _repo.GetByIdAsync(review.PlanId)
            ?? throw new InvalidOperationException("Plan not found.");

        plan.Status = PlanStatus.Frozen;
        await _repo.UpdateAsync(plan);
    }

    private async Task<WeeklyPlanDto> GetActivePlanDtoWithDetails(Guid planId)
    {
        var plan = await _repo.GetPlanWithDetailsAsync(planId);
        return _mapper.Map<WeeklyPlanDto>(plan);
    }
}
