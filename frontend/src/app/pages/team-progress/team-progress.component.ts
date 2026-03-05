import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService, ProgressService, BacklogService } from '../../services';
import { MemberProgressSummary, ItemCategory } from '../../models';

/**
 * Team Progress Dashboard — overview of all members, categories, and overall progress.
 */
@Component({
    selector: 'app-team-progress',
    templateUrl: './team-progress.component.html',
    styleUrl: './team-progress.component.css'
})
export class TeamProgressComponent {
    private router = inject(Router);
    planService = inject(PlanService);
    progressService = inject(ProgressService);
    backlogService = inject(BacklogService);

    /** Overall team progress. */
    get overallProgress(): number {
        return this.progressService.getOverallProgress();
    }

    get totalTasksDone(): number {
        return this.progressService.getTotalTasksDone();
    }

    get totalTasks(): number {
        return this.progressService.getTotalTasks();
    }

    get totalBlocked(): number {
        return this.progressService.getTotalBlocked();
    }

    /** All member summaries. */
    get memberSummaries(): MemberProgressSummary[] {
        return this.progressService.getAllMemberProgress();
    }

    /** Category progress. */
    getCategoryProgress(category: ItemCategory) {
        const budget = this.planService.getCategoryBudget(category);
        const progress = this.progressService.getCategoryProgress(category);
        return { ...budget, ...progress };
    }

    /** Navigate to task detail. */
    viewDetail(): void {
        this.router.navigate(['/task-detail']);
    }

    /** Progress bar color. */
    getProgressColor(percent: number): string {
        if (percent >= 80) return 'green';
        if (percent >= 40) return 'amber';
        return '';
    }

    /** Avatar gradients. */
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
