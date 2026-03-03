import { Injectable, signal, computed } from '@angular/core';
import { TeamMember, MemberRole } from '../models';

/**
 * Service for managing team members.
 * All data is persisted to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class TeamService {
    private readonly STORAGE_KEY = 'weekwise-team';

    /** Reactive signal holding the full list of team members. */
    private _members = signal<TeamMember[]>(this.loadFromStorage());

    /** Read-only signal of all members. */
    readonly members = this._members.asReadonly();

    /** Computed: only active members. */
    readonly activeMembers = computed(() => this._members().filter(m => m.isActive));

    /** Computed: the team lead(s). */
    readonly leads = computed(() => this._members().filter(m => m.role === 'Lead' && m.isActive));

    /** Generate a unique ID. */
    private generateId(): string {
        return crypto.randomUUID();
    }

    /** Load members from localStorage. */
    private loadFromStorage(): TeamMember[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    /** Persist current state to localStorage. */
    private saveToStorage(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._members()));
    }

    /** Add a new team member. */
    addMember(name: string, role: MemberRole = 'Member'): TeamMember {
        const member: TeamMember = {
            id: this.generateId(),
            name: name.trim(),
            role,
            isActive: true
        };
        this._members.update(members => [...members, member]);
        this.saveToStorage();
        return member;
    }

    /** Update a member's name or role. */
    updateMember(id: string, changes: Partial<Pick<TeamMember, 'name' | 'role' | 'isActive'>>): void {
        this._members.update(members =>
            members.map(m => m.id === id ? { ...m, ...changes } : m)
        );
        this.saveToStorage();
    }

    /** Remove a member entirely. */
    removeMember(id: string): void {
        this._members.update(members => members.filter(m => m.id !== id));
        this.saveToStorage();
    }

    /** Set a member as the lead (and demote others). */
    setLead(id: string): void {
        this._members.update(members =>
            members.map(m => ({
                ...m,
                role: m.id === id ? 'Lead' as MemberRole : 'Member' as MemberRole
            }))
        );
        this.saveToStorage();
    }

    /** Get a member by ID. */
    getMemberById(id: string): TeamMember | undefined {
        return this._members().find(m => m.id === id);
    }

    /** Replace all members (used by data import). */
    setAll(members: TeamMember[]): void {
        this._members.set(members);
        this.saveToStorage();
    }
}
