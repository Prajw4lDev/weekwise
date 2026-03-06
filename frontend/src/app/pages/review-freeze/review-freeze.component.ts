import { Component, inject } from '@angular/core';
<<<<<<< feature/frontend-backend-integration
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService, TeamService, BacklogService } from '../../services';
import { ItemCategory } from '../../models';

/**
 * Review and freeze the plan (Lead only).
 * Shows category and member summaries.
=======
import { Router } from '@angular/router';
import { PlanService, BacklogService, TeamService } from '../../services';
import { CategoryBudget, MemberPlanSummary, ItemCategory } from '../../models';

/**
 * Review & Freeze screen (Lead only).
 * Shows category budget summary, member plan summaries, and freeze button.
>>>>>>> main
 */
@Component({
    selector: 'app-review-freeze',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './review-freeze.component.html',
    styleUrl: './review-freeze.component.css'
})
export class ReviewFreezeComponent {
    private router = inject(Router);
    planService = inject(PlanService);
<<<<<<< feature/frontend-backend-integration
    teamService = inject(TeamService);
    backlogService = inject(BacklogService);
    protected readonly Math = Math;

    /** Category summaries for the current plan. */
    get categorySummaries() {
        return this.planService.getAllCategoryBudgets();
    }

    /** Member summaries for the current plan. */
    get memberSummaries() {
        return this.planService.getMemberPlanSummaries();
    }

    /** Detailed allocations per member and category. */
    get memberAllocations() {
        const summaries = this.memberSummaries;
        const commitments = this.planService.commitments();
        const allocations: { memberName: string, category: ItemCategory, hours: number, percentage: number }[] = [];

        for (const s of summaries) {
            const memberCommitments = commitments.filter(c => c.memberId === s.member.id);
            const categories: ItemCategory[] = ['Client', 'TechDebt', 'RnD'];

            for (const cat of categories) {
                const hours = memberCommitments
                    .filter(c => this.backlogService.getItemById(c.backlogItemId)?.category === cat)
                    .reduce((sum, c) => sum + c.committedHours, 0);

                if (hours > 0) {
                    allocations.push({
                        memberName: s.member.name,
                        category: cat,
                        hours,
                        percentage: Math.round((hours / s.committedHours) * 100)
                    });
                }
            }
        }
        return allocations;
    }

    /** Freeze the plan and return to dashboard. */
    async freezePlan(): Promise<void> {
        if (!this.planService.canFreeze()) return;

        const success = await this.planService.freezePlan();
        if (success) {
            this.router.navigate(['/home-admin']);
        } else {
            alert('Failed to freeze plan. Please check the console for details.');
        }
    }
=======
    backlogService = inject(BacklogService);
    teamService = inject(TeamService);

    /** Category budget summaries. */
    get categoryBudgets(): CategoryBudget[] {
        return this.planService.getAllCategoryBudgets();
    }

    /** Member plan summaries. */
    get memberSummaries(): MemberPlanSummary[] {
        return this.planService.getMemberPlanSummaries();
    }

    /** Can the plan be frozen? */
    get canFreeze(): boolean {
        return this.planService.canFreeze();
    }

    /** Validation issues preventing freeze. */
    get freezeIssues(): string[] {
        return this.planService.getFreezeValidationIssues();
    }

    /** Freeze the plan. */
    freezePlan(): void {
        if (this.planService.freezePlan()) {
            this.router.navigate(['/home']);
        }
    }

    /** Get progress percent for a category budget. */
    getProgressPercent(budget: CategoryBudget): number {
        return budget.budgetHours > 0
            ? Math.round((budget.claimedHours / budget.budgetHours) * 100)
            : 0;
    }

    /** Get progress bar color class. */
    getProgressColor(percent: number): string {
        if (percent >= 90) return 'green';
        if (percent >= 50) return 'amber';
        return '';
    }

    /** Get category label. */
    getCategoryLabel(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return '🟢 Client';
            case 'TechDebt': return '🟡 Tech Debt';
            case 'RnD': return '🔵 R&D';
        }
    }

    /** Get category badge class. */
    getCategoryClass(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return 'badge-client';
            case 'TechDebt': return 'badge-techdebt';
            case 'RnD': return 'badge-rnd';
        }
    }

    /** Avatar gradient by index. */
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
>>>>>>> main
}
