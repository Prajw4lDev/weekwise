using AutoMapper;
using Moq;
using Weekwise.Api.Mappings;
using Weekwise.Core.DTOs.WeeklyPlan;
using Weekwise.Core.DTOs.WorkCommitment;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Services;

namespace Weekwise.Tests.Services;

public class WeeklyPlanServiceTests
{
    private readonly Mock<IWeeklyPlanRepository> _planRepoMock;
    private readonly Mock<ITeamMemberRepository> _memberRepoMock;
    private readonly Mock<IBacklogItemRepository> _backlogRepoMock;
    private readonly Mock<IWorkCommitmentRepository> _commitRepoMock;
    private readonly IMapper _mapper;
    private readonly WeeklyPlanService _service;

    public WeeklyPlanServiceTests()
    {
        _planRepoMock = new Mock<IWeeklyPlanRepository>();
        _memberRepoMock = new Mock<ITeamMemberRepository>();
        _backlogRepoMock = new Mock<IBacklogItemRepository>();
        _commitRepoMock = new Mock<IWorkCommitmentRepository>();

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _service = new WeeklyPlanService(
            _planRepoMock.Object,
            _memberRepoMock.Object,
            _backlogRepoMock.Object,
            _commitRepoMock.Object,
            _mapper);
    }

    [Fact]
    public async Task CreatePlanAsync_NoActivePlan_CreatesPlan()
    {
        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync((WeeklyPlan?)null);
        _planRepoMock.Setup(r => r.AddAsync(It.IsAny<WeeklyPlan>())).ReturnsAsync((WeeklyPlan p) => p);

        var result = await _service.CreatePlanAsync();

        Assert.Equal(PlanStatus.Setup, result.Status);
    }

    [Fact]
    public async Task CreatePlanAsync_ActivePlanExists_ThrowsInvalidOp()
    {
        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync(new WeeklyPlan { Status = PlanStatus.Planning });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreatePlanAsync());
    }

    [Fact]
    public async Task SetupPlanAsync_PercentsNot100_ThrowsInvalidOp()
    {
        var plan = new WeeklyPlan { Id = Guid.NewGuid(), Status = PlanStatus.Setup, PlanMembers = new List<PlanMember>() };
        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync(plan);

        var dto = new SetupWeeklyPlanDto
        {
            MemberIds = new List<Guid> { Guid.NewGuid() },
            ClientPercent = 50, TechDebtPercent = 30, RndPercent = 10 // Sum = 90
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.SetupPlanAsync(dto));
    }

    [Fact]
    public async Task SetupPlanAsync_NoMembers_ThrowsInvalidOp()
    {
        var plan = new WeeklyPlan { Id = Guid.NewGuid(), Status = PlanStatus.Setup, PlanMembers = new List<PlanMember>() };
        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync(plan);

        var dto = new SetupWeeklyPlanDto
        {
            MemberIds = new List<Guid>(),
            ClientPercent = 60, TechDebtPercent = 25, RndPercent = 15
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.SetupPlanAsync(dto));
    }

    [Fact]
    public async Task CancelPlanAsync_NoActivePlan_ThrowsInvalidOp()
    {
        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync((WeeklyPlan?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CancelPlanAsync());
    }

    [Fact]
    public async Task CompletePlanAsync_FrozenPlan_Succeeds()
    {
        var plan = new WeeklyPlan { Id = Guid.NewGuid(), Status = PlanStatus.Frozen };
        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync(plan);
        _planRepoMock.Setup(r => r.UpdateAsync(It.IsAny<WeeklyPlan>())).Returns(Task.CompletedTask);

        await _service.CompletePlanAsync();

        Assert.Equal(PlanStatus.Completed, plan.Status);
    }

    [Fact]
    public async Task CompletePlanAsync_PlanningPlan_ThrowsInvalidOp()
    {
        var plan = new WeeklyPlan { Id = Guid.NewGuid(), Status = PlanStatus.Planning };
        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync(plan);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CompletePlanAsync());
    }

    [Fact]
    public async Task AddCommitmentAsync_Exceeds30h_ThrowsInvalidOp()
    {
        var memberId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var plan = new WeeklyPlan
        {
            Id = Guid.NewGuid(), Status = PlanStatus.Planning, ClientPercent = 100, TechDebtPercent = 0, RndPercent = 0, TotalHours = 30,
            PlanMembers = new List<PlanMember> { new() { MemberId = memberId } }
        };

        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync(plan);
        _backlogRepoMock.Setup(r => r.GetByIdAsync(itemId)).ReturnsAsync(new BacklogItem { Id = itemId, Category = ItemCategory.Client });
        _commitRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<WorkCommitment, bool>>>()))
            .ReturnsAsync(new List<WorkCommitment>());
        _commitRepoMock.Setup(r => r.GetByMemberAsync(memberId, plan.Id))
            .ReturnsAsync(new List<WorkCommitment> { new() { CommittedHours = 25 } });

        var dto = new CreateCommitmentDto { MemberId = memberId, BacklogItemId = itemId, CommittedHours = 10 };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.AddCommitmentAsync(dto));
    }

    [Fact]
    public async Task AddCommitmentAsync_ArchivedItem_ThrowsInvalidOp()
    {
        var memberId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var plan = new WeeklyPlan
        {
            Id = Guid.NewGuid(), Status = PlanStatus.Planning,
            PlanMembers = new List<PlanMember> { new() { MemberId = memberId } }
        };

        _planRepoMock.Setup(r => r.GetActivePlanAsync()).ReturnsAsync(plan);
        _backlogRepoMock.Setup(r => r.GetByIdAsync(itemId)).ReturnsAsync(new BacklogItem { Id = itemId, IsArchived = true });

        var dto = new CreateCommitmentDto { MemberId = memberId, BacklogItemId = itemId, CommittedHours = 5 };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.AddCommitmentAsync(dto));
    }

    [Fact]
    public async Task GetHistoryAsync_ReturnsCompletedPlans()
    {
        var plans = new List<WeeklyPlan>
        {
            new() { Id = Guid.NewGuid(), Status = PlanStatus.Completed, PlanMembers = new List<PlanMember>() },
            new() { Id = Guid.NewGuid(), Status = PlanStatus.Completed, PlanMembers = new List<PlanMember>() }
        };
        _planRepoMock.Setup(r => r.GetCompletedPlansAsync()).ReturnsAsync(plans);

        var result = await _service.GetHistoryAsync();

        Assert.Equal(2, result.Count());
    }
}
