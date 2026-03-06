import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './pick-item.component.html',
    styleUrl: './pick-item.component.css'
})
export class PickItemComponent implements OnInit {
    private router = inject(Router);
    private planService = inject(PlanService);
    private backlogService = inject(BacklogService);
    private userContext = inject(UserContextService);

    // Reactive State
    backlogItems = signal<BacklogItem[]>([]);
    selectedItemId = signal<string | null>(null);
    hoursToCommit = signal<number>(1);
    activeFilter = signal<ItemCategory | 'All'>('All');

    // Computed Values
    memberId = computed(() => this.userContext.currentUser()?.id ?? '');

    remainingHours = computed(() => {
        const id = this.memberId();
        return id ? this.planService.getMemberRemainingHours(id) : 0;
    });

    availableItems = computed(() => {
        const id = this.memberId();
        if (!id) return [];
        const myCommitments = this.planService.getMemberCommitments(id);
        const myItemIds = new Set(myCommitments.map(c => c.backlogItemId));
        return this.backlogItems().filter(i => !myItemIds.has(i.id));
    });

    filteredItems = computed(() => {
        const items = this.availableItems();
        const filter = this.activeFilter();
        return filter === 'All' ? items : items.filter(i => i.category === filter);
    });

    selectedItem = computed(() => {
        const id = this.selectedItemId();
        return id ? this.backlogService.getItemById(id) : undefined;
    });

    maxHours = computed(() => {
        const item = this.selectedItem();
        if (!item) return this.remainingHours();
        const catRemaining = this.planService.getCategoryRemainingHours(item.category);
        return Math.min(this.remainingHours(), catRemaining, item.estimatedHours);
    });

    canAdd = computed(() => {
        const id = this.selectedItemId();
        const hours = this.hoursToCommit();
        const max = this.maxHours();
        return !!id && hours > 0 && hours <= max;
    });

    async ngOnInit() {
        // Load backlog items
        const items = await this.backlogService.loadItems();
        this.backlogItems.set(items);
    }

    setFilter(filter: ItemCategory | 'All'): void {
        this.activeFilter.set(filter);
    }

    selectItem(item: BacklogItem): void {
        this.selectedItemId.set(item.id);
        this.hoursToCommit.set(Math.min(this.maxHours(), item.estimatedHours));
    }

    async addToPlan() {
        const itemId = this.selectedItemId();
        const hours = this.hoursToCommit();
        const mId = this.memberId();

        if (!itemId || hours <= 0 || !mId) return;

        const success = await this.planService.addCommitment(mId, itemId, hours);
        if (success) {
            this.router.navigate(['/my-plan']);
        }
    }

    goBack(): void {
        this.router.navigate(['/my-plan']);
    }

    getCategoryLabel(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return '🟢 Client';
            case 'TechDebt': return '🟡 Tech Debt';
            case 'RnD': return '🔵 R&D';
            default: return cat;
        }
    }

    getCategoryClass(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return 'badge-client';
            case 'TechDebt': return 'badge-techdebt';
            case 'RnD': return 'badge-rnd';
            default: return '';
        }
    }
}
