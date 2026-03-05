using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;

namespace Weekwise.Infrastructure.Data;

/// <summary>
/// EF Core database context for the Weekwise application.
/// </summary>
public class WeekwiseDbContext : DbContext
{
    public WeekwiseDbContext(DbContextOptions<WeekwiseDbContext> options)
        : base(options)
    {
    }

    // DbSet properties
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<BacklogItem> BacklogItems => Set<BacklogItem>();
    public DbSet<WeeklyPlan> WeeklyPlans => Set<WeeklyPlan>();
    public DbSet<PlanMember> PlanMembers => Set<PlanMember>();
    public DbSet<WorkCommitment> WorkCommitments => Set<WorkCommitment>();
    public DbSet<ProgressUpdate> ProgressUpdates => Set<ProgressUpdate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─────────────────────────────────────────────
        // TeamMember
        // ─────────────────────────────────────────────
        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role)
                  .IsRequired()
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasIndex(e => e.Name);
        });

        // ─────────────────────────────────────────────
        // BacklogItem
        // ─────────────────────────────────────────────
        modelBuilder.Entity<BacklogItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category)
                  .IsRequired()
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(e => e.EstimatedHours).IsRequired();
            entity.Property(e => e.IsArchived).HasDefaultValue(false);

            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.IsArchived);
        });

        // ─────────────────────────────────────────────
        // WeeklyPlan
        // ─────────────────────────────────────────────
        modelBuilder.Entity<WeeklyPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.WeekStartDate).IsRequired();
            entity.Property(e => e.Status)
                  .IsRequired()
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(e => e.ClientPercent).HasDefaultValue(0);
            entity.Property(e => e.TechDebtPercent).HasDefaultValue(0);
            entity.Property(e => e.RndPercent).HasDefaultValue(0);
            entity.Property(e => e.TotalHours).HasDefaultValue(0);

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.WeekStartDate);
        });

        // ─────────────────────────────────────────────
        // PlanMember (junction: WeeklyPlan ↔ TeamMember)
        // ─────────────────────────────────────────────
        modelBuilder.Entity<PlanMember>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.WeeklyPlan)
                  .WithMany(p => p.PlanMembers)
                  .HasForeignKey(e => e.WeeklyPlanId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Member)
                  .WithMany(m => m.PlanMemberships)
                  .HasForeignKey(e => e.MemberId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate member in same plan
            entity.HasIndex(e => new { e.WeeklyPlanId, e.MemberId }).IsUnique();
        });

        // ─────────────────────────────────────────────
        // WorkCommitment
        // ─────────────────────────────────────────────
        modelBuilder.Entity<WorkCommitment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CommittedHours).IsRequired();

            entity.HasOne(e => e.WeeklyPlan)
                  .WithMany(p => p.WorkCommitments)
                  .HasForeignKey(e => e.WeeklyPlanId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Member)
                  .WithMany(m => m.WorkCommitments)
                  .HasForeignKey(e => e.MemberId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.BacklogItem)
                  .WithMany(b => b.WorkCommitments)
                  .HasForeignKey(e => e.BacklogItemId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Prevent same member committing same backlog item in same plan
            entity.HasIndex(e => new { e.WeeklyPlanId, e.MemberId, e.BacklogItemId }).IsUnique();
        });

        // ─────────────────────────────────────────────
        // ProgressUpdate
        // ─────────────────────────────────────────────
        modelBuilder.Entity<ProgressUpdate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.HoursCompleted).IsRequired();
            entity.Property(e => e.Status)
                  .IsRequired()
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasOne(e => e.WorkCommitment)
                  .WithMany(c => c.ProgressUpdates)
                  .HasForeignKey(e => e.WorkCommitmentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.WorkCommitmentId);
            entity.HasIndex(e => e.UpdatedAt);
        });
    }
}
