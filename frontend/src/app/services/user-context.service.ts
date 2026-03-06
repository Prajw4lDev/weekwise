import { Injectable, signal, computed } from '@angular/core';
import { TeamMember } from '../models';

/**
 * Tracks the currently logged-in user.
 * Persisted to localStorage so the user stays logged in across reloads.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
    private readonly STORAGE_KEY = 'weekwise-current-user';

    /** The currently logged-in user (or null). */
    private _currentUser = signal<TeamMember | null>(this.loadFromStorage());

    /** Read-only signal of the current user. */
    readonly currentUser = this._currentUser.asReadonly();

    /** Computed: is the current user a Lead? */
    readonly isLead = computed(() => this._currentUser()?.role === 'Admin');

    /** Computed: is any user logged in? */
    readonly isLoggedIn = computed(() => this._currentUser() !== null);

    private loadFromStorage(): TeamMember | null {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }

    private saveToStorage(): void {
        const user = this._currentUser();
        if (user) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }

    /** Log in as a specific team member. */
    setUser(member: TeamMember): void {
        this._currentUser.set(member);
        this.saveToStorage();
    }

    /** Log out the current user. */
    clearUser(): void {
        this._currentUser.set(null);
        this.saveToStorage();
    }
}
