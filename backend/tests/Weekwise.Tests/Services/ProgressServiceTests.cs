using AutoMapper;
using Moq;
using Weekwise.Api.Mappings;
using Weekwise.Core.DTOs.Progress;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Services;

namespace Weekwise.Tests.Services;

public class ProgressServiceTests
{
    private readonly Mock<IProgressUpdateRepository> _progressRepoMock;
    private readonly Mock<IWorkCommitmentRepository> _commitRepoMock;
    private readonly Mock<IWeeklyPlanRepository> _planRepoMock;
    private readonly IMapper _mapper;
    private readonly ProgressService _service;

    public ProgressServiceTests()
    {
        _progressRepoMock = new Mock<IProgressUpdateRepository>();
        _commitRepoMock = new Mock<IWorkCommitmentRepository>();
        _planRepoMock = new Mock<IWeeklyPlanRepository>();

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _service = new ProgressService(
            _progressRepoMock.Object,
            _commitRepoMock.Object,
            _planRepoMock.Object,
            _mapper);
    }

    [Fact]
    public async Task UpdateProgressAsync_CommitmentNotFound_ThrowsKeyNotFound()
    {
        _commitRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((WorkCommitment?)null);

        var dto = new UpdateProgressDto { HoursCompleted = 5, Status = TaskItemStatus.InProgress };

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateProgressAsync(Guid.NewGuid(), dto));
    }

    [Fact]
    public async Task UpdateProgressAsync_PlanNotFrozen_ThrowsInvalidOp()
    {
        var commitId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        _commitRepoMock.Setup(r => r.GetByIdAsync(commitId)).ReturnsAsync(
            new WorkCommitment { Id = commitId, WeeklyPlanId = planId });
        _planRepoMock.Setup(r => r.GetByIdAsync(planId)).ReturnsAsync(
            new WeeklyPlan { Id = planId, Status = PlanStatus.Planning });

        var dto = new UpdateProgressDto { HoursCompleted = 5, Status = TaskItemStatus.InProgress };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateProgressAsync(commitId, dto));
    }

    [Fact]
    public async Task UpdateProgressAsync_FrozenPlan_Succeeds()
    {
        var commitId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        _commitRepoMock.Setup(r => r.GetByIdAsync(commitId)).ReturnsAsync(
            new WorkCommitment { Id = commitId, WeeklyPlanId = planId, CommittedHours = 10 });
        _planRepoMock.Setup(r => r.GetByIdAsync(planId)).ReturnsAsync(
            new WeeklyPlan { Id = planId, Status = PlanStatus.Frozen });
        _progressRepoMock.Setup(r => r.AddAsync(It.IsAny<ProgressUpdate>())).ReturnsAsync((ProgressUpdate p) => p);

        var dto = new UpdateProgressDto { HoursCompleted = 5, Status = TaskItemStatus.InProgress, Notes = "Good progress" };
        var result = await _service.UpdateProgressAsync(commitId, dto);

        Assert.Equal(5, result.HoursCompleted);
        Assert.Equal(TaskItemStatus.InProgress, result.Status);
    }

    [Fact]
    public async Task GetHistoryAsync_ReturnsOrderedUpdates()
    {
        var commitId = Guid.NewGuid();
        var updates = new List<ProgressUpdate>
        {
            new() { Id = Guid.NewGuid(), WorkCommitmentId = commitId, HoursCompleted = 3, Status = TaskItemStatus.InProgress, UpdatedAt = DateTime.UtcNow.AddHours(-2) },
            new() { Id = Guid.NewGuid(), WorkCommitmentId = commitId, HoursCompleted = 8, Status = TaskItemStatus.Done, UpdatedAt = DateTime.UtcNow }
        };
        _progressRepoMock.Setup(r => r.GetByCommitmentAsync(commitId)).ReturnsAsync(updates);

        var result = await _service.GetHistoryAsync(commitId);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetLatestAsync_ReturnsLatestUpdate()
    {
        var commitId = Guid.NewGuid();
        var latest = new ProgressUpdate { Id = Guid.NewGuid(), WorkCommitmentId = commitId, HoursCompleted = 10, Status = TaskItemStatus.Done, UpdatedAt = DateTime.UtcNow };
        _progressRepoMock.Setup(r => r.GetLatestByCommitmentAsync(commitId)).ReturnsAsync(latest);

        var result = await _service.GetLatestAsync(commitId);

        Assert.NotNull(result);
        Assert.Equal(TaskItemStatus.Done, result!.Status);
    }

    [Fact]
    public async Task GetLatestAsync_NoUpdates_ReturnsNull()
    {
        _progressRepoMock.Setup(r => r.GetLatestByCommitmentAsync(It.IsAny<Guid>())).ReturnsAsync((ProgressUpdate?)null);

        var result = await _service.GetLatestAsync(Guid.NewGuid());

        Assert.Null(result);
    }
}
