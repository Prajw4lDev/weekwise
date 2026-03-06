import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanService, BacklogService, UserContextService } from '../../services';
import { BacklogItem, ItemCategory } from '../../models';

/**
 * Pick a backlog item screen.
 * Lists available backlog items, lets the user select one and specify hours.
 * Validates against remaining member hours and category budget.
 */
@Component({
    selector: 'app-pick-item',
    imports: [FormsModule],
    templateUrl: './pick-item.component.html',
    styleUrl: './pick-item.component.css'
})
export class PickItemComponent {
    private router = inject(Router);
    planService = inject(PlanService);
    backlogService = inject(BacklogService);
    userContext = inject(UserContextService);

    /** Active category filter. */
    activeFilter: ItemCategory | 'All' = 'All';

    /** Currently selected backlog item. */
    selectedItemId: string | null = null;

    /** Hours to commit. */
    hoursToCommit: number = 1;

    /** Current user's ID. */
    get memberId(): string {
        return this.userContext.currentUser()?.id ?? '';
    }

    /** Hours remaining for this member. */
    get remainingHours(): number {
        return this.planService.getMemberRemainingHours(this.memberId);
    }

    /** Available items (not yet committed by this member). */
    get availableItems(): BacklogItem[] {
        const myCommitments = this.planService.getMemberCommitments(this.memberId);
        const myItemIds = new Set(myCommitments.map(c => c.backlogItemId));
        let items = this.backlogService.activeItems().filter(i => !myItemIds.has(i.id));
        if (this.activeFilter !== 'All') {
            items = items.filter(i => i.category === this.activeFilter);
        }
        return items;
    }

    /** Selected item object. */
    get selectedItem(): BacklogItem | undefined {
        return this.selectedItemId ? this.backlogService.getItemById(this.selectedItemId) : undefined;
    }

    /** Max hours user can commit (min of remaining hours and category remaining). */
    get maxHours(): number {
        const item = this.selectedItem;
        if (!item) return this.remainingHours;
        const catRemaining = this.planService.getCategoryRemainingHours(item.category);
        return Math.min(this.remainingHours, catRemaining, item.estimatedHours);
    }

    /** Can we add this item? */
    get canAdd(): boolean {
        return !!this.selectedItemId &&
            this.hoursToCommit > 0 &&
            this.hoursToCommit <= this.maxHours;
    }

    /** Set the active filter. */
    setFilter(filter: ItemCategory | 'All'): void {
        this.activeFilter = filter;
    }

    /** Select an item. */
    selectItem(itemId: string): void {
        this.selectedItemId = itemId;
        this.hoursToCommit = Math.min(this.maxHours, this.selectedItem?.estimatedHours ?? 1);
    }

    /** Add the selected item to the plan. */
    addToPlan(): void {
        if (!this.canAdd || !this.selectedItemId) return;
        const result = this.planService.addCommitment(this.memberId, this.selectedItemId, this.hoursToCommit);
        if (result) {
            this.router.navigate(['/my-plan']);
        }
    }

    /** Go back to My Plan. */
    goBack(): void {
        this.router.navigate(['/my-plan']);
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
}
