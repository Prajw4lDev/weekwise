using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Weekwise.Core.DTOs.BacklogItem;
using Weekwise.Core.DTOs.Progress;
using Weekwise.Core.DTOs.TeamMember;
using Weekwise.Core.DTOs.WeeklyPlan;
using Weekwise.Core.DTOs.WorkCommitment;
using Weekwise.Core.Enums;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Tests.Integration;

public class WorkflowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public WorkflowTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing SQLite registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<WeekwiseDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add In-Memory Database for testing
                services.AddDbContext<WeekwiseDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDatabase");
                });
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task FullWeeklyCycle_ShouldSucceed()
    {
        // 1. Create Team Member (Lead)
        var createMemberDto = new CreateTeamMemberDto { Name = "Alice Doe", Role = MemberRole.Lead };
        var memberResponse = await _client.PostAsJsonAsync("/api/team", createMemberDto);
        memberResponse.EnsureSuccessStatusCode();
        var member = await memberResponse.Content.ReadFromJsonAsync<TeamMemberDto>();
        Assert.NotNull(member);

        // 2. Create Backlog Item
        var createBacklogDto = new CreateBacklogItemDto 
        { 
            Title = "Implement Feature X", 
            Description = "Details of X", 
            Category = ItemCategory.ClientFocused, 
            EstimatedHours = 10 
        };
        var backlogResponse = await _client.PostAsJsonAsync("/api/backlog", createBacklogDto);
        backlogResponse.EnsureSuccessStatusCode();
        var backlogItem = await backlogResponse.Content.ReadFromJsonAsync<BacklogItemDto>();
        Assert.NotNull(backlogItem);

        // 3. Create Weekly Plan
        var createPlanResponse = await _client.PostAsync("/api/plan", null);
        createPlanResponse.EnsureSuccessStatusCode();
        var plan = await createPlanResponse.Content.ReadFromJsonAsync<WeeklyPlanDto>();
        Assert.NotNull(plan);

        // 4. Setup Plan (Assign member and set percentages)
        var setupDto = new SetupWeeklyPlanDto 
        { 
            MemberIds = new List<Guid> { member.Id },
            ClientPercent = 60,
            TechDebtPercent = 20,
            RnDPercent = 20
        };
        var setupResponse = await _client.PutAsJsonAsync("/api/plan/setup", setupDto);
        setupResponse.EnsureSuccessStatusCode();

        // 5. Add Work Commitment
        var commitmentDto = new CreateCommitmentDto 
        { 
            MemberId = member.Id, 
            BacklogItemId = backlogItem.Id, 
            CommittedHours = 8 
        };
        var commitmentResponse = await _client.PostAsJsonAsync("/api/plan/commitments", commitmentDto);
        commitmentResponse.EnsureSuccessStatusCode();
        var commitment = await commitmentResponse.Content.ReadFromJsonAsync<WorkCommitmentDto>();
        Assert.NotNull(commitment);

        // 6. Freeze Plan
        var freezeResponse = await _client.PostAsync("/api/plan/freeze", null);
        freezeResponse.EnsureSuccessStatusCode();

        // 7. Update Progress
        var progressDto = new UpdateProgressDto 
        { 
            HoursCompleted = 5, 
            Status = TaskItemStatus.InProgress, 
            Notes = "Halfway done" 
        };
        var progressResponse = await _client.PostAsJsonAsync($"/api/progress/{commitment.Id}", progressDto);
        progressResponse.EnsureSuccessStatusCode();

        // 8. Complete Plan
        var completeResponse = await _client.PostAsync("/api/plan/complete", null);
        completeResponse.EnsureSuccessStatusCode();

        // Verify final state in history
        var historyResponse = await _client.GetAsync("/api/plan/history");
        historyResponse.EnsureSuccessStatusCode();
        var history = await historyResponse.Content.ReadFromJsonAsync<IEnumerable<WeeklyPlanDto>>();
        Assert.Contains(history, p => p.Id == plan.Id && p.Status == PlanStatus.Completed);
    }
}
