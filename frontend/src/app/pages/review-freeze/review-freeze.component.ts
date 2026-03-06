import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService, TeamService, BacklogService } from '../../services';
import { ItemCategory } from '../../models';

/**
 * Review and freeze the plan (Lead only).
 * Shows category and member summaries.
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
}
