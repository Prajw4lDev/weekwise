using AutoMapper;
using Moq;
using Weekwise.Api.Mappings;
using Weekwise.Core.DTOs.TeamMember;
using Weekwise.Core.Entities;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Services;

namespace Weekwise.Tests.Services;

public class TeamMemberServiceTests
{
    private readonly Mock<ITeamMemberRepository> _repoMock;
    private readonly Mock<IWorkCommitmentRepository> _commitMock;
    private readonly Mock<IInvitationRepository> _invitationMock;
    private readonly Mock<IJwtService> _jwtMock;
    private readonly IMapper _mapper;
    private readonly TeamMemberService _service;

    public TeamMemberServiceTests()
    {
        _repoMock = new Mock<ITeamMemberRepository>();
        _commitMock = new Mock<IWorkCommitmentRepository>();
        _invitationMock = new Mock<IInvitationRepository>();
        _jwtMock = new Mock<IJwtService>();
        _jwtMock.Setup(j => j.GenerateToken(It.IsAny<TeamMember>())).Returns("test-token");

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _service = new TeamMemberService(_repoMock.Object, _commitMock.Object, _invitationMock.Object, _mapper, _jwtMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsMappedDtos()
    {
        var members = new List<TeamMember>
        {
            new() { Id = Guid.NewGuid(), Name = "Alice", Role = "Admin", IsActive = true },
            new() { Id = Guid.NewGuid(), Name = "Bob", Role = "Member", IsActive = true }
        };
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(members);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_FirstMember_AutoBecomesAdmin()
    {
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<TeamMember>());
        _repoMock.Setup(r => r.AddAsync(It.IsAny<TeamMember>())).ReturnsAsync((TeamMember t) => t);

        var dto = new CreateTeamMemberDto { Name = "Alice" };
        var result = await _service.CreateAsync(dto);

        Assert.Equal("Admin", result.Role);
    }

    [Fact]
    public async Task CreateAsync_SecondMember_StaysMember()
    {
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<TeamMember>
        {
            new() { Id = Guid.NewGuid(), Name = "Alice", Role = "Admin" }
        });
        _repoMock.Setup(r => r.AddAsync(It.IsAny<TeamMember>())).ReturnsAsync((TeamMember t) => t);

        var dto = new CreateTeamMemberDto { Name = "Bob" };
        var result = await _service.CreateAsync(dto);

        Assert.Equal("Member", result.Role);
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
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(new TeamMember { Id = id, Name = "Bob", Role = "Member" });
        _commitMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<WorkCommitment, bool>>>()))
            .ReturnsAsync(new List<WorkCommitment> { new() });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));
    }

    [Fact]
    public async Task DeleteAsync_OnlyAdmin_ThrowsInvalidOp()
    {
        var id = Guid.NewGuid();
        var lead = new TeamMember { Id = id, Name = "Alice", Role = "Admin", IsActive = true };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(lead);
        _commitMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<WorkCommitment, bool>>>()))
            .ReturnsAsync(new List<WorkCommitment>());
        _repoMock.Setup(r => r.GetActiveMembersAsync()).ReturnsAsync(new List<TeamMember> { lead });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));
    }

    [Fact]
    public async Task SetLeadAsync_PromotesMemberAndDemotesExisting()
    {
        var currentLead = new TeamMember { Id = Guid.NewGuid(), Name = "Alice", Role = "Admin", IsActive = true };
        var newLead = new TeamMember { Id = Guid.NewGuid(), Name = "Bob", Role = "Member", IsActive = true };

        _repoMock.Setup(r => r.GetByIdAsync(newLead.Id)).ReturnsAsync(newLead);
        _repoMock.Setup(r => r.GetActiveMembersAsync()).ReturnsAsync(new List<TeamMember> { currentLead, newLead });
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<TeamMember>())).Returns(Task.CompletedTask);

        var result = await _service.SetLeadAsync(newLead.Id);

        Assert.Equal("Admin", result.Role);
        Assert.Equal("Member", currentLead.Role);
    }

    [Fact]
    public async Task UpdateAsync_DemoteOnlyAdmin_ThrowsInvalidOp()
    {
        var id = Guid.NewGuid();
        var lead = new TeamMember { Id = id, Name = "Alice", Role = "Admin", IsActive = true };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(lead);
        _repoMock.Setup(r => r.GetActiveMembersAsync()).ReturnsAsync(new List<TeamMember> { lead });

        var dto = new UpdateTeamMemberDto { Name = "Alice", Role = "Member", IsActive = true };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(id, dto));
    }
}
