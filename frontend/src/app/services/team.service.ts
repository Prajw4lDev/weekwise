import { Injectable, signal, computed } from '@angular/core';
import { TeamMember, MemberRole } from '../models';
import { Observable, of } from 'rxjs';

/**
 * Service for managing team members.
 * Uses localStorage instead of .NET Backend API for demo purposes.
 */
@Injectable({ providedIn: 'root' })
export class TeamService {
    private readonly STORAGE_KEY = 'weekwise-team';

    /** Reactive signal holding the full list of team members. */
    private _members = signal<TeamMember[]>([]);

    /** Read-only signal of all members. */
    readonly members = this._members.asReadonly();

    /** Bulk set members (used by DataService). */
    setAll(members: TeamMember[]): void {
        this._members.set(members);
        this.saveMembers(members);
    }

    /** Computed: only active members. */
    readonly activeMembers = computed(() => this._members().filter(m => m.isActive));

    /** Computed: the team lead(s). */
    readonly leads = computed(() => this._members().filter(m => m.role === 'Admin' && m.isActive));

    constructor() {
        this.loadMembers();
    }

    private saveMembers(members: TeamMember[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(members));
    }

    /** Reload and get members as Observable. */
    getMembers(): Observable<TeamMember[]> {
        return of(this._members());
    }

    /** Load members from the backend/localStorage. */
    async loadMembers(): Promise<void> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            this._members.set(JSON.parse(stored));
        }
    }

    async addMember(name: string, email: string, role: MemberRole = 'Member', password = '123', weeklyCapacityHours = 40): Promise<TeamMember> {
        const member: TeamMember = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.trim(),
            role,
            weeklyCapacityHours,
            isActive: true
        };

        this._members.update(members => {
            const updated = [...members, member];
            this.saveMembers(updated);
            return updated;
        });
        return member;
    }

    /** Log in a team member with their name and a password. */
    async login(name: string, password: string): Promise<TeamMember | null> {
        const member = this._members().find(m => m.name.toLowerCase() === name.toLowerCase());
        return member || null;
    }

    /** Update a member's name or role. */
    async updateMember(id: string, changes: Partial<Pick<TeamMember, 'name' | 'role' | 'isActive'>>): Promise<void> {
        this._members.update(members => {
            const updated = members.map(m => m.id === id ? { ...m, ...changes } : m);
            this.saveMembers(updated);
            return updated;
        });
    }

    /** Remove a member entirely. */
    async removeMember(id: string): Promise<void> {
        this._members.update(members => {
            const updated = members.filter(m => m.id !== id);
            this.saveMembers(updated);
            return updated;
        });
    }

    /** Set a member as the lead. */
    async setLead(id: string): Promise<void> {
        this._members.update(members => {
            const updated = members.map(m => ({
                ...m,
                role: (m.id === id ? 'Admin' : 'Member') as MemberRole
            }));
            this.saveMembers(updated);
            return updated;
        });
    }

    /** Get a member by ID. */
    getMemberById(id: string): TeamMember | undefined {
        return this._members().find(m => m.id === id);
    }
}
