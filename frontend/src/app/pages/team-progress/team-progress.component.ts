import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService, ProgressService, BacklogService } from '../../services';
import { MemberProgressSummary, ItemCategory } from '../../models';

/**
 * Team Progress Dashboard.
 */
@Component({
    selector: 'app-team-progress',
    standalone: true,
    imports: [CommonModule],
    template: `
<section id="screen-team-progress">
    <div class="page-header">
        <h2>Team Progress</h2>
        <button class="btn btn-ghost" (click)="goBack()">Go Back</button>
    </div>

    <!-- Overall Stats -->
    <div class="stats-grid mb-lg">
        <div class="stat-card stat-card-primary">
            <div class="stat-body">
                <div class="stat-value text-gradient">{{ overallProgress }}%</div>
                <div class="stat-label">Overall Progress</div>
                <div class="progress-bar-container mt-sm">
                    <div class="progress-bar-fill" [class]="getProgressColor(overallProgress)"
                        [style.width.%]="overallProgress"></div>
                </div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-body">
                <div class="stat-value" style="color: var(--status-done, #10b981);">
                    {{ totalTasksDone }} / {{ totalTasks }}
                </div>
                <div class="stat-label">Tasks Done</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-body">
                <div class="stat-value" style="color: var(--status-blocked, #ef4444);">
                    {{ totalBlocked }}
                </div>
                <div class="stat-label">Blocked</div>
            </div>
        </div>
    </div>

    <!-- By Category -->
    <h3 class="section-title mb-md">By Category</h3>
    <div class="category-grid mb-lg">
        @for (cat of ['Client', 'TechDebt', 'RnD']; track cat) {
        <div class="category-card" [style.border-left-color]="cat === 'Client' ? 'var(--cat-client)' : cat === 'TechDebt' ? 'var(--cat-techdebt)' : 'var(--cat-rnd)'">
            <span class="badge" [class]="cat === 'Client' ? 'badge-client' : cat === 'TechDebt' ? 'badge-techdebt' : 'badge-rnd'">
                {{ cat === 'RnD' ? 'RnD' : cat === 'TechDebt' ? 'Tech Debt' : cat }}
            </span>
            <div class="category-hours">
                {{ getCategoryProgress($any(cat)).done }}h 
                <span class="text-secondary">/ {{ getCategoryProgress($any(cat)).budgetHours }}h</span>
            </div>
            <div class="progress-bar-container mt-sm">
                <div class="progress-bar-fill" [class]="getProgressColor(getCategoryProgress($any(cat)).percent)"
                    [style.width.%]="getCategoryProgress($any(cat)).percent"></div>
            </div>
            <div class="category-pct">{{ getCategoryProgress($any(cat)).percent }}%</div>
        </div>
        }
    </div>

    <!-- By Member -->
    <h3 class="section-title mb-md">By Member</h3>
    @if (memberSummaries.length === 0) {
    <div class="glass-card no-hover text-center p-xl">
        <p class="text-secondary">No progress data available yet.</p>
    </div>
    } @else {
    <div class="glass-card no-hover">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Member</th>
                    <th>Progress</th>
                    <th>Hours</th>
                    <th>Tasks</th>
                    <th>Blocked</th>
                </tr>
            </thead>
            <tbody>
                @for (summary of memberSummaries; track summary.member.id; let i = $index) {
                <tr style="cursor:pointer;" (click)="viewDetail()">
                    <td>
                        <div class="flex items-center gap-sm">
                            <div class="avatar" [style.background]="getGradient(i)"
                                style="width:28px;height:28px;font-size:0.7rem;">
                                {{ summary.member.name.charAt(0) }}
                            </div>
                            <span>{{ summary.member.name }}</span>
                        </div>
                    </td>
                    <td>
                        <div class="flex items-center gap-sm">
                            <div class="progress-bar-container" style="width:100px;">
                                <div class="progress-bar-fill" [class]="getProgressColor(summary.progressPercent)"
                                    [style.width.%]="summary.progressPercent"></div>
                            </div>
                            <span style="font-size:0.85rem;">{{ summary.progressPercent }}%</span>
                        </div>
                    </td>
                    <td>{{ summary.totalDone }}h / {{ summary.totalCommitted }}h</td>
                    <td>{{ summary.tasksDone }} / {{ summary.totalTasks }}</td>
                    <td>
                        @if (summary.blockedTasks > 0) {
                        <span style="color:var(--status-blocked); font-weight:600;">{{ summary.blockedTasks }}</span>
                        } @else {
                        <span class="text-muted">0</span>
                        }
                    </td>
                </tr>
                }
            </tbody>
        </table>
    </div>
    }
</section>
    `,
    styleUrl: './team-progress.component.css'
})
export class TeamProgressComponent {
    private router = inject(Router);
    planService = inject(PlanService);
    progressService = inject(ProgressService);
    backlogService = inject(BacklogService);

    get overallProgress(): number { return this.progressService.getOverallProgress(); }
    get totalTasksDone(): number { return this.progressService.getTotalTasksDone(); }
    get totalTasks(): number { return this.progressService.getTotalTasks(); }
    get totalBlocked(): number { return this.progressService.getTotalBlocked(); }
    get memberSummaries(): MemberProgressSummary[] { return this.progressService.getAllMemberProgress(); }

    getCategoryProgress(category: string) {
        const cat = category as ItemCategory;
        const budget = this.planService.getCategoryBudget(cat);
        const progress = this.progressService.getCategoryProgress(cat);
        return { ...budget, ...progress };
    }

    viewDetail(): void { this.router.navigate(['/task-detail']); }
    goBack(): void { this.router.navigate(['/progress']); }

    getProgressColor(percent: number): string {
        if (percent >= 80) return 'green';
        if (percent >= 40) return 'amber';
        return '';
    }

    getGradient(index: number): string {
        const gradients = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #3b82f6, #06b6d4)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #ec4899, #f43f5e)',
        ];
        return gradients[index % gradients.length];
    }
}