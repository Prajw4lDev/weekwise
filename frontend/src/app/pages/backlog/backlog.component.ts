import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BacklogService, AuthService } from '../../services';
import { BacklogItem, ItemCategory } from '../../models';

/**
 * Backlog management screen.
 * Full CRUD for backlog items with category filtering and inline editing.
 */
@Component({
    selector: 'app-backlog',
    imports: [FormsModule],
    templateUrl: './backlog.component.html',
    styleUrl: './backlog.component.css'
})
export class BacklogComponent {
    backlogService = inject(BacklogService);
    authService = inject(AuthService);

    /** Currently active filter tab. */
    activeFilter: ItemCategory | 'All' = 'All';

    /** Form fields for add/edit. */
    formTitle = '';
    formDescription = '';
    formCategory: ItemCategory | '' = '';
    formEstimatedHours: number | null = null;

    /** Are we editing an existing item? */
    editingItemId: string | null = null;

    /** Is the add/edit form visible? */
    showForm = false;

    /** Filtered items based on active tab. */
    get filteredItems(): BacklogItem[] {
        const items = this.backlogService.activeItems();
        if (this.activeFilter === 'All') return items;
        return items.filter(i => i.category === this.activeFilter);
    }

    /** Set the active filter tab. */
    setFilter(filter: ItemCategory | 'All'): void {
        this.activeFilter = filter;
    }

    /** Open the form for adding a new item. */
    openAddForm(): void {
        this.resetForm();
        this.showForm = true;
    }

    /** Open the form for editing an existing item. */
    openEditForm(item: BacklogItem): void {
        this.editingItemId = item.id;
        this.formTitle = item.title;
        this.formDescription = item.description;
        this.formCategory = item.category;
        this.formEstimatedHours = item.estimatedHours;
        this.showForm = true;
    }

    /** Save the form — add or update. */
    async saveItem(): Promise<void> {
        if (!this.formTitle.trim() || !this.formCategory || !this.formEstimatedHours) return;

        if (this.editingItemId) {
            await this.backlogService.updateItem(this.editingItemId, {
                title: this.formTitle.trim(),
                description: this.formDescription.trim(),
                category: this.formCategory as ItemCategory,
                estimatedHours: this.formEstimatedHours
            });
        } else {
            await this.backlogService.addItem(
                this.formTitle,
                this.formDescription,
                this.formCategory as ItemCategory,
                this.formEstimatedHours
            );
        }
        this.resetForm();
        this.showForm = false;
    }

    /** Cancel and hide the form. */
    cancelForm(): void {
        this.resetForm();
        this.showForm = false;
    }

    /** Delete a backlog item. */
    async deleteItem(id: string): Promise<void> {
        await this.backlogService.deleteItem(id);
    }

    /** Reset form fields. */
    private resetForm(): void {
        this.editingItemId = null;
        this.formTitle = '';
        this.formDescription = '';
        this.formCategory = '';
        this.formEstimatedHours = null;
    }

    /** Get the emoji + label for a category. */
    getCategoryLabel(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return '🟢 Client';
            case 'TechDebt': return '🟡 Tech Debt';
            case 'RnD': return '🔵 R&D';
        }
    }

    /** Get the CSS class for a category badge. */
    getCategoryClass(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return 'badge-client';
            case 'TechDebt': return 'badge-techdebt';
            case 'RnD': return 'badge-rnd';
        }
    }

    /** Is the form valid for submission? */
    get isFormValid(): boolean {
        return !!this.formTitle.trim() && !!this.formCategory && !!this.formEstimatedHours && this.formEstimatedHours > 0;
    }
}
