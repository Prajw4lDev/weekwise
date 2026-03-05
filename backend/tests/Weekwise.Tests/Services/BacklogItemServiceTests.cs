using AutoMapper;
using Moq;
using Weekwise.Api.Mappings;
using Weekwise.Core.DTOs.BacklogItem;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Services;

namespace Weekwise.Tests.Services;

public class BacklogItemServiceTests
{
    private readonly Mock<IBacklogItemRepository> _repoMock;
    private readonly Mock<IWorkCommitmentRepository> _commitMock;
    private readonly IMapper _mapper;
    private readonly BacklogItemService _service;

    public BacklogItemServiceTests()
    {
        _repoMock = new Mock<IBacklogItemRepository>();
        _commitMock = new Mock<IWorkCommitmentRepository>();

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _service = new BacklogItemService(_repoMock.Object, _commitMock.Object, _mapper);
    }

    [Fact]
    public async Task GetActiveItemsAsync_NoFilter_ReturnsAll()
    {
        var items = new List<BacklogItem>
        {
            new() { Id = Guid.NewGuid(), Title = "Task 1", Category = ItemCategory.Client, EstimatedHours = 5 },
            new() { Id = Guid.NewGuid(), Title = "Task 2", Category = ItemCategory.TechDebt, EstimatedHours = 3 }
        };
        _repoMock.Setup(r => r.GetActiveItemsAsync()).ReturnsAsync(items);

        var result = await _service.GetActiveItemsAsync(null);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetActiveItemsAsync_WithFilter_ReturnsByCategory()
    {
        var items = new List<BacklogItem>
        {
            new() { Id = Guid.NewGuid(), Title = "Task 1", Category = ItemCategory.Client, EstimatedHours = 5 }
        };
        _repoMock.Setup(r => r.GetByCategoryAsync(ItemCategory.Client)).ReturnsAsync(items);

        var result = await _service.GetActiveItemsAsync(ItemCategory.Client);

        Assert.Single(result);
    }

    [Fact]
    public async Task CreateAsync_ValidItem_ReturnsDto()
    {
        _repoMock.Setup(r => r.AddAsync(It.IsAny<BacklogItem>())).ReturnsAsync((BacklogItem b) => b);

        var dto = new CreateBacklogItemDto { Title = "New Task", Category = ItemCategory.Client, EstimatedHours = 5 };
        var result = await _service.CreateAsync(dto);

        Assert.Equal("New Task", result.Title);
        Assert.Equal(ItemCategory.Client, result.Category);
    }

    [Fact]
    public async Task CreateAsync_ZeroHours_ThrowsInvalidOp()
    {
        var dto = new CreateBacklogItemDto { Title = "Bad Task", Category = ItemCategory.Client, EstimatedHours = 0 };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task DeleteAsync_WithCommitments_ThrowsInvalidOp()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(new BacklogItem { Id = id, Title = "Task" });
        _commitMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<WorkCommitment, bool>>>()))
            .ReturnsAsync(new List<WorkCommitment> { new() });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));
    }

    [Fact]
    public async Task DeleteAsync_NotFound_ThrowsKeyNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((BacklogItem?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task ArchiveAsync_SetsIsArchivedTrue()
    {
        var id = Guid.NewGuid();
        var item = new BacklogItem { Id = id, Title = "Task", IsArchived = false };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(item);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<BacklogItem>())).Returns(Task.CompletedTask);

        var result = await _service.ArchiveAsync(id);

        Assert.True(result.IsArchived);
    }

    [Fact]
    public async Task UpdateAsync_NegativeHours_ThrowsInvalidOp()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(new BacklogItem { Id = id, Title = "Task", EstimatedHours = 5 });

        var dto = new UpdateBacklogItemDto { Title = "Task", Category = ItemCategory.Client, EstimatedHours = -1 };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(id, dto));
    }
}
