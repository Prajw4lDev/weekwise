import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService, TeamService, BacklogService } from '../../services';
import { ItemCategory, CategoryBudget, MemberPlanSummary } from '../../models';

/**
 * Review & Freeze screen (Lead only).
 * Shows category distribution, member summaries, and freeze button.
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
    private planService = inject(PlanService);
    private teamService = inject(TeamService);
    private backlogService = inject(BacklogService);

    protected readonly Math = Math;

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

    /** Freeze the plan. */
    async freezePlan(): Promise<void> {
        if (!this.planService.canFreeze()) return;

        const success = await this.planService.freezePlan();
        if (success) {
            this.router.navigate(['/home-admin']);
        } else {
            alert('Failed to freeze plan. Please check the console for details.');
        }
    }

    /** Get progress bar color class. */
    getProgressColor(percent: number): string {
        if (percent >= 100) return 'var(--status-done)';
        if (percent >= 50) return 'var(--status-inprogress)';
        return 'var(--status-notstarted)';
    }

    /** Get progress color (vibrant for gradients). */
    getProgressVibrantColor(percent: number): string {
        if (percent >= 90) return '#10b981'; // Green
        if (percent >= 50) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    }

    /** Get category label. */
    getCategoryLabel(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return '🟢 Client';
            case 'TechDebt': return '🟡 Tech Debt';
            case 'RnD': return '🔵 R&D';
            default: return cat;
        }
    }

    /** Get category badge class. */
    getCategoryClass(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return 'badge-client';
            case 'TechDebt': return 'badge-techdebt';
            case 'RnD': return 'badge-rnd';
            default: return '';
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
}
