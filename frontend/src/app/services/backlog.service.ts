import { Injectable, signal, computed } from '@angular/core';
import { BacklogItem, ItemCategory } from '../models';

/**
 * Service for managing backlog items.
 * Provides CRUD operations and category filtering.
 * All data persisted to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class BacklogService {
    private readonly STORAGE_KEY = 'weekwise-backlog';

    /** Reactive signal holding all backlog items. */
    private _items = signal<BacklogItem[]>(this.loadFromStorage());

    /** Read-only signal of all items. */
    readonly items = this._items.asReadonly();

    /** Computed: only non-archived items. */
    readonly activeItems = computed(() => this._items().filter(i => !i.isArchived));

    /** Get items filtered by category. */
    getByCategory(category: ItemCategory): BacklogItem[] {
        return this.activeItems().filter(i => i.category === category);
    }

    private generateId(): string {
        return crypto.randomUUID();
    }

    private loadFromStorage(): BacklogItem[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveToStorage(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._items()));
    }

    /** Add a new backlog item. */
    addItem(title: string, description: string, category: ItemCategory, estimatedHours: number): BacklogItem {
        const item: BacklogItem = {
            id: this.generateId(),
            title: title.trim(),
            description: description.trim(),
            category,
            estimatedHours,
            isArchived: false
        };
        this._items.update(items => [...items, item]);
        this.saveToStorage();
        return item;
    }

    /** Update an existing backlog item. */
    updateItem(id: string, changes: Partial<Omit<BacklogItem, 'id'>>): void {
        this._items.update(items =>
            items.map(i => i.id === id ? { ...i, ...changes } : i)
        );
        this.saveToStorage();
    }

    /** Archive a backlog item (soft delete). */
    archiveItem(id: string): void {
        this.updateItem(id, { isArchived: true });
    }

    /** Permanently delete a backlog item. */
    deleteItem(id: string): void {
        this._items.update(items => items.filter(i => i.id !== id));
        this.saveToStorage();
    }

    /** Get a single item by ID. */
    getItemById(id: string): BacklogItem | undefined {
        return this._items().find(i => i.id === id);
    }

    /** Replace all items (used by data import). */
    setAll(items: BacklogItem[]): void {
        this._items.set(items);
        this.saveToStorage();
    }
}
