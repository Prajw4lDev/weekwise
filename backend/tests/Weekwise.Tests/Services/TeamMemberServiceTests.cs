using AutoMapper;
using Moq;
using Weekwise.Api.Mappings;
using Weekwise.Core.DTOs.TeamMember;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Services;

namespace Weekwise.Tests.Services;

public class TeamMemberServiceTests
{
    private readonly Mock<ITeamMemberRepository> _repoMock;
    private readonly Mock<IWorkCommitmentRepository> _commitMock;
    private readonly IMapper _mapper;
    private readonly TeamMemberService _service;

    public TeamMemberServiceTests()
    {
        _repoMock = new Mock<ITeamMemberRepository>();
        _commitMock = new Mock<IWorkCommitmentRepository>();

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _service = new TeamMemberService(_repoMock.Object, _commitMock.Object, _mapper);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsMappedDtos()
    {
        var members = new List<TeamMember>
        {
            new() { Id = Guid.NewGuid(), Name = "Alice", Role = MemberRole.Lead, IsActive = true },
            new() { Id = Guid.NewGuid(), Name = "Bob", Role = MemberRole.Member, IsActive = true }
        };
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(members);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_FirstMember_AutoBecomesLead()
    {
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<TeamMember>());
        _repoMock.Setup(r => r.AddAsync(It.IsAny<TeamMember>())).ReturnsAsync((TeamMember t) => t);

        var dto = new CreateTeamMemberDto { Name = "Alice" };
        var result = await _service.CreateAsync(dto);

        Assert.Equal(MemberRole.Lead, result.Role);
    }

    [Fact]
    public async Task CreateAsync_SecondMember_StaysMember()
    {
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<TeamMember>
        {
            new() { Id = Guid.NewGuid(), Name = "Alice", Role = MemberRole.Lead }
        });
        _repoMock.Setup(r => r.AddAsync(It.IsAny<TeamMember>())).ReturnsAsync((TeamMember t) => t);

        var dto = new CreateTeamMemberDto { Name = "Bob" };
        var result = await _service.CreateAsync(dto);

        Assert.Equal(MemberRole.Member, result.Role);
    }

    [Fact]
    public async Task DeleteAsync_MemberNotFound_ThrowsKeyNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((TeamMember?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task DeleteAsync_MemberWithCommitments_ThrowsInvalidOp()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(new TeamMember { Id = id, Name = "Bob", Role = MemberRole.Member });
        _commitMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<WorkCommitment, bool>>>()))
            .ReturnsAsync(new List<WorkCommitment> { new() });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));
    }

    [Fact]
    public async Task DeleteAsync_OnlyLead_ThrowsInvalidOp()
    {
        var id = Guid.NewGuid();
        var lead = new TeamMember { Id = id, Name = "Alice", Role = MemberRole.Lead, IsActive = true };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(lead);
        _commitMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<WorkCommitment, bool>>>()))
            .ReturnsAsync(new List<WorkCommitment>());
        _repoMock.Setup(r => r.GetActiveMembersAsync()).ReturnsAsync(new List<TeamMember> { lead });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));
    }

    [Fact]
    public async Task SetLeadAsync_PromotesMemberAndDemotesExisting()
    {
        var currentLead = new TeamMember { Id = Guid.NewGuid(), Name = "Alice", Role = MemberRole.Lead, IsActive = true };
        var newLead = new TeamMember { Id = Guid.NewGuid(), Name = "Bob", Role = MemberRole.Member, IsActive = true };

        _repoMock.Setup(r => r.GetByIdAsync(newLead.Id)).ReturnsAsync(newLead);
        _repoMock.Setup(r => r.GetActiveMembersAsync()).ReturnsAsync(new List<TeamMember> { currentLead, newLead });
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<TeamMember>())).Returns(Task.CompletedTask);

        var result = await _service.SetLeadAsync(newLead.Id);

        Assert.Equal(MemberRole.Lead, result.Role);
        Assert.Equal(MemberRole.Member, currentLead.Role);
    }

    [Fact]
    public async Task UpdateAsync_DemoteOnlyLead_ThrowsInvalidOp()
    {
        var id = Guid.NewGuid();
        var lead = new TeamMember { Id = id, Name = "Alice", Role = MemberRole.Lead, IsActive = true };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(lead);
        _repoMock.Setup(r => r.GetActiveMembersAsync()).ReturnsAsync(new List<TeamMember> { lead });

        var dto = new UpdateTeamMemberDto { Name = "Alice", Role = MemberRole.Member, IsActive = true };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(id, dto));
    }
}
