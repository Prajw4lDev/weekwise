using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Infrastructure.Services;

public class DataService : IDataService
{
    private readonly WeekwiseDbContext _db;

    public DataService(WeekwiseDbContext db)
    {
        _db = db;
    }

    public async Task<object> ExportAllAsync()
    {
        var data = new
        {
            ExportedAt = DateTime.UtcNow,
            TeamMembers = await _db.TeamMembers.ToListAsync(),
            BacklogItems = await _db.BacklogItems.ToListAsync(),
            WeeklyPlans = await _db.WeeklyPlans
                .Include(p => p.PlanMembers)
                .Include(p => p.WorkCommitments)
                    .ThenInclude(c => c.ProgressUpdates)
                .ToListAsync()
        };

        return data;
    }

    public async Task ImportAllAsync(string jsonData)
    {
        var doc = JsonDocument.Parse(jsonData);
        var root = doc.RootElement;
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Clear existing data in reverse dependency order
        await ResetAllAsync();

        // Import TeamMembers
        if (root.TryGetProperty("teamMembers", out var membersEl))
        {
            var members = JsonSerializer.Deserialize<List<TeamMember>>(membersEl.GetRawText(), options);
            if (members != null)
            {
                await _db.TeamMembers.AddRangeAsync(members);
            }
        }

        // Import BacklogItems
        if (root.TryGetProperty("backlogItems", out var itemsEl))
        {
            var items = JsonSerializer.Deserialize<List<BacklogItem>>(itemsEl.GetRawText(), options);
            if (items != null)
            {
                await _db.BacklogItems.AddRangeAsync(items);
            }
        }

        // Import WeeklyPlans (without nav properties — we handle them separately)
        if (root.TryGetProperty("weeklyPlans", out var plansEl))
        {
            foreach (var planEl in plansEl.EnumerateArray())
            {
                var plan = new WeeklyPlan
                {
                    Id = planEl.GetProperty("id").GetGuid(),
                    WeekStartDate = planEl.GetProperty("weekStartDate").GetDateTime(),
                    Status = Enum.Parse<PlanStatus>(planEl.GetProperty("status").GetString()!),
                    ClientPercent = planEl.GetProperty("clientPercent").GetInt32(),
                    TechDebtPercent = planEl.GetProperty("techDebtPercent").GetInt32(),
                    RndPercent = planEl.GetProperty("rndPercent").GetInt32(),
                    TotalHours = planEl.GetProperty("totalHours").GetDouble(),
                };

                await _db.WeeklyPlans.AddAsync(plan);

                // PlanMembers
                if (planEl.TryGetProperty("planMembers", out var pmEl))
                {
                    foreach (var pmItem in pmEl.EnumerateArray())
                    {
                        var pm = new PlanMember
                        {
                            Id = pmItem.GetProperty("id").GetGuid(),
                            WeeklyPlanId = plan.Id,
                            MemberId = pmItem.GetProperty("memberId").GetGuid()
                        };
                        await _db.PlanMembers.AddAsync(pm);
                    }
                }

                // WorkCommitments
                if (planEl.TryGetProperty("workCommitments", out var wcEl))
                {
                    foreach (var wcItem in wcEl.EnumerateArray())
                    {
                        var wc = new WorkCommitment
                        {
                            Id = wcItem.GetProperty("id").GetGuid(),
                            WeeklyPlanId = plan.Id,
                            MemberId = wcItem.GetProperty("memberId").GetGuid(),
                            BacklogItemId = wcItem.GetProperty("backlogItemId").GetGuid(),
                            CommittedHours = wcItem.GetProperty("committedHours").GetDouble()
                        };
                        await _db.WorkCommitments.AddAsync(wc);

                        // ProgressUpdates
                        if (wcItem.TryGetProperty("progressUpdates", out var puEl))
                        {
                            foreach (var puItem in puEl.EnumerateArray())
                            {
                                var pu = new ProgressUpdate
                                {
                                    Id = puItem.GetProperty("id").GetGuid(),
                                    WorkCommitmentId = wc.Id,
                                    HoursCompleted = puItem.GetProperty("hoursCompleted").GetDouble(),
                                    Status = Enum.Parse<TaskItemStatus>(puItem.GetProperty("status").GetString()!),
                                    Notes = puItem.TryGetProperty("notes", out var notesEl) ? notesEl.GetString() ?? "" : "",
                                    UpdatedAt = puItem.GetProperty("updatedAt").GetDateTime()
                                };
                                await _db.ProgressUpdates.AddAsync(pu);
                            }
                        }
                    }
                }
            }
        }

        await _db.SaveChangesAsync();
    }

    public async Task SeedDemoDataAsync()
    {
        // Clear existing data first
        await ResetAllAsync();

        // ── Team Members ──
        var lead = new TeamMember { Id = Guid.NewGuid(), Name = "Alice Johnson", Role = MemberRole.Lead, IsActive = true };
        var dev1 = new TeamMember { Id = Guid.NewGuid(), Name = "Bob Smith", Role = MemberRole.Member, IsActive = true };
        var dev2 = new TeamMember { Id = Guid.NewGuid(), Name = "Carol Davis", Role = MemberRole.Member, IsActive = true };

        await _db.TeamMembers.AddRangeAsync(lead, dev1, dev2);

        // ── Backlog Items ──
        var task1 = new BacklogItem { Id = Guid.NewGuid(), Title = "User Auth Module", Description = "Implement JWT authentication", Category = ItemCategory.Client, EstimatedHours = 12 };
        var task2 = new BacklogItem { Id = Guid.NewGuid(), Title = "Dashboard API", Description = "Build dashboard analytics endpoints", Category = ItemCategory.Client, EstimatedHours = 8 };
        var task3 = new BacklogItem { Id = Guid.NewGuid(), Title = "Refactor DB Queries", Description = "Optimize slow SQL queries", Category = ItemCategory.TechDebt, EstimatedHours = 6 };
        var task4 = new BacklogItem { Id = Guid.NewGuid(), Title = "AI Feature Prototype", Description = "Explore ML.NET for suggestions", Category = ItemCategory.RnD, EstimatedHours = 10 };
        var task5 = new BacklogItem { Id = Guid.NewGuid(), Title = "Payment Integration", Description = "Stripe payment gateway setup", Category = ItemCategory.Client, EstimatedHours = 15 };
        var task6 = new BacklogItem { Id = Guid.NewGuid(), Title = "Code Review Tooling", Description = "Set up automated code review", Category = ItemCategory.TechDebt, EstimatedHours = 4 };

        await _db.BacklogItems.AddRangeAsync(task1, task2, task3, task4, task5, task6);

        // ── Weekly Plan (Frozen, ready for progress) ──
        var plan = new WeeklyPlan
        {
            Id = Guid.NewGuid(),
            WeekStartDate = DateTime.UtcNow.Date,
            Status = PlanStatus.Frozen,
            ClientPercent = 60,
            TechDebtPercent = 25,
            RndPercent = 15,
            TotalHours = 90 // 3 members × 30h
        };

        await _db.WeeklyPlans.AddAsync(plan);

        // ── Plan Members ──
        await _db.PlanMembers.AddRangeAsync(
            new PlanMember { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = lead.Id },
            new PlanMember { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev1.Id },
            new PlanMember { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev2.Id }
        );

        // ── Work Commitments ──
        var c1 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = lead.Id, BacklogItemId = task1.Id, CommittedHours = 12 };
        var c2 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = lead.Id, BacklogItemId = task2.Id, CommittedHours = 8 };
        var c3 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = lead.Id, BacklogItemId = task3.Id, CommittedHours = 6 };
        var c4 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev1.Id, BacklogItemId = task4.Id, CommittedHours = 10 };
        var c5 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev1.Id, BacklogItemId = task5.Id, CommittedHours = 15 };
        var c6 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev2.Id, BacklogItemId = task6.Id, CommittedHours = 4 };
        var c7 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev1.Id, BacklogItemId = task3.Id, CommittedHours = 5 };
        var c8 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev2.Id, BacklogItemId = task1.Id, CommittedHours = 10 };
        var c9 = new WorkCommitment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, MemberId = dev2.Id, BacklogItemId = task4.Id, CommittedHours = 10 };

        await _db.WorkCommitments.AddRangeAsync(c1, c2, c3, c4, c5, c6, c7, c8, c9);

        // ── Progress Updates (some tasks in progress) ──
        await _db.ProgressUpdates.AddRangeAsync(
            new ProgressUpdate { Id = Guid.NewGuid(), WorkCommitmentId = c1.Id, HoursCompleted = 8, Status = TaskItemStatus.InProgress, Notes = "Auth flow working, need to add refresh tokens", UpdatedAt = DateTime.UtcNow.AddDays(-2) },
            new ProgressUpdate { Id = Guid.NewGuid(), WorkCommitmentId = c1.Id, HoursCompleted = 12, Status = TaskItemStatus.Done, Notes = "Completed with full test coverage", UpdatedAt = DateTime.UtcNow.AddDays(-1) },
            new ProgressUpdate { Id = Guid.NewGuid(), WorkCommitmentId = c2.Id, HoursCompleted = 4, Status = TaskItemStatus.InProgress, Notes = "Overview endpoint done", UpdatedAt = DateTime.UtcNow.AddDays(-1) },
            new ProgressUpdate { Id = Guid.NewGuid(), WorkCommitmentId = c4.Id, HoursCompleted = 3, Status = TaskItemStatus.InProgress, Notes = "Setting up ML.NET pipeline", UpdatedAt = DateTime.UtcNow },
            new ProgressUpdate { Id = Guid.NewGuid(), WorkCommitmentId = c6.Id, HoursCompleted = 4, Status = TaskItemStatus.Done, Notes = "Code review tooling configured", UpdatedAt = DateTime.UtcNow }
        );

        await _db.SaveChangesAsync();
    }

    public async Task ResetAllAsync()
    {
        // Delete in reverse dependency order
        _db.ProgressUpdates.RemoveRange(await _db.ProgressUpdates.ToListAsync());
        _db.WorkCommitments.RemoveRange(await _db.WorkCommitments.ToListAsync());
        _db.PlanMembers.RemoveRange(await _db.PlanMembers.ToListAsync());
        _db.WeeklyPlans.RemoveRange(await _db.WeeklyPlans.ToListAsync());
        _db.BacklogItems.RemoveRange(await _db.BacklogItems.ToListAsync());
        _db.TeamMembers.RemoveRange(await _db.TeamMembers.ToListAsync());
        await _db.SaveChangesAsync();
    }
}
