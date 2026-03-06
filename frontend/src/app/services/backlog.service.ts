import { Injectable, signal, computed } from '@angular/core';
import { BacklogItem, ItemCategory } from '../models';

/**
 * Service for managing backlog items.
 * Uses localStorage instead of .NET Backend.
 */
@Injectable({ providedIn: 'root' })
export class BacklogService {
    private readonly STORAGE_KEY = 'weekwise-backlog';

    /** Reactive signal holding all backlog items. */
    private _items = signal<BacklogItem[]>([]);

    /** Read-only signal of all items. */
    readonly items = this._items.asReadonly();

    /** Bulk set items (used by DataService). */
    setAll(items: BacklogItem[]): void {
        this._items.set(items);
        this.saveItems(items);
    }

    /** Computed: only non-archived items. */
    readonly activeItems = computed(() => this._items().filter(i => !i.isArchived));

    constructor() {
        this.loadItems();
    }

    private saveItems(items: BacklogItem[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    }

    /** Load items from the backend/localStorage. */
    async loadItems(): Promise<BacklogItem[]> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            const items = JSON.parse(stored);
            this._items.set(items);
            return items;
        }
        return [];
    }

    /** Get items filtered by category. */
    getByCategory(category: ItemCategory): BacklogItem[] {
        return this.activeItems().filter(i => i.category === category);
    }

    /** Add a new backlog item. */
    async addItem(title: string, description: string, category: ItemCategory, estimatedHours: number): Promise<BacklogItem> {
        const item: BacklogItem = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            category,
            estimatedHours,
            isArchived: false
        };

        this._items.update(items => {
            const updated = [...items, item];
            this.saveItems(updated);
            return updated;
        });
        return item;
    }

    /** Update an existing backlog item. */
    async updateItem(id: string, changes: Partial<Omit<BacklogItem, 'id'>>): Promise<void> {
        this._items.update(items => {
            const updated = items.map(i => i.id === id ? { ...i, ...changes } : i);
            this.saveItems(updated);
            return updated;
        });
    }

    /** Archive a backlog item (soft delete). */
    async archiveItem(id: string): Promise<void> {
        this.updateLocalItemState(id, { isArchived: true });
    }

    /** Permanently delete a backlog item. */
    async deleteItem(id: string): Promise<void> {
        this._items.update(items => {
            const updated = items.filter(i => i.id !== id);
            this.saveItems(updated);
            return updated;
        });
    }

    /** Get a single item by ID. */
    getItemById(id: string): BacklogItem | undefined {
        return this._items().find(i => i.id === id);
    }

    private updateLocalItemState(id: string, changes: Partial<BacklogItem>): void {
        this._items.update(items => {
            const updated = items.map(i => i.id === id ? { ...i, ...changes } : i);
            this.saveItems(updated);
            return updated;
        });
    }
}
