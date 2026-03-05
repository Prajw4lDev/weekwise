import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService, BacklogService, UserContextService } from '../../services';
import { WorkCommitment, BacklogItem, ItemCategory } from '../../models';

/**
 * Plan My Work screen — member picks backlog items and commits hours.
 * Shows budget bar (30h), current commitments, and "Add" button.
 */
@Component({
    selector: 'app-my-plan',
    templateUrl: './my-plan.component.html',
    styleUrl: './my-plan.component.css'
})
export class MyPlanComponent {
    private router = inject(Router);
    planService = inject(PlanService);
    backlogService = inject(BacklogService);
    userContext = inject(UserContextService);

    /** Current user's ID. */
    get memberId(): string {
        return this.userContext.currentUser()?.id ?? '';
    }

    /** Current user's commitments. */
    get myCommitments(): WorkCommitment[] {
        return this.planService.getMemberCommitments(this.memberId);
    }

    /** Total hours committed by this user. */
    get committedHours(): number {
        return this.planService.getMemberCommittedHours(this.memberId);
    }

    /** Hours remaining. */
    get remainingHours(): number {
        return this.planService.getMemberRemainingHours(this.memberId);
    }

    /** Get the backlog item for a commitment. */
    getBacklogItem(commitmentId: string): BacklogItem | undefined {
        const commitment = this.myCommitments.find(c => c.id === commitmentId);
        if (!commitment) return undefined;
        return this.backlogService.getItemById(commitment.backlogItemId);
    }

    /** Get backlog item by its ID. */
    getItemById(backlogItemId: string): BacklogItem | undefined {
        return this.backlogService.getItemById(backlogItemId);
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

    /** Remove a commitment. */
    removeCommitment(commitmentId: string): void {
        this.planService.removeCommitment(commitmentId);
    }

    /** Navigate to pick item screen. */
    pickItem(): void {
        this.router.navigate(['/pick-item']);
    }
}
