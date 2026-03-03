import { Injectable, signal, inject } from '@angular/core';
import {
    ProgressUpdate, TaskStatus, WorkCommitment,
    MemberProgressSummary, ItemCategory
} from '../models';
import { PlanService } from './plan.service';
import { BacklogService } from './backlog.service';
import { TeamService } from './team.service';

/**
 * Service for tracking progress on frozen plan commitments.
 * Handles progress updates, calculates summaries by member and category.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
    private readonly STORAGE_KEY = 'weekwise-progress';

    private planService = inject(PlanService);
    private backlogService = inject(BacklogService);
    private teamService = inject(TeamService);

    /** All progress updates for the current plan. */
    private _updates = signal<ProgressUpdate[]>(this.loadFromStorage());

    readonly updates = this._updates.asReadonly();

    private loadFromStorage(): ProgressUpdate[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveToStorage(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._updates()));
    }

    private generateId(): string {
        return crypto.randomUUID();
    }

    // --- Progress Updates ---

    /** Update progress on a commitment. Creates a new ProgressUpdate entry. */
    updateProgress(commitmentId: string, hoursCompleted: number, status: TaskStatus, notes: string): ProgressUpdate {
        const update: ProgressUpdate = {
            id: this.generateId(),
            workCommitmentId: commitmentId,
            hoursCompleted,
            status,
            notes: notes.trim(),
            updatedAt: new Date().toISOString()
        };
        this._updates.update(u => [...u, update]);
        this.saveToStorage();
        return update;
    }

    /** Get the latest progress update for a commitment. */
    getLatestUpdate(commitmentId: string): ProgressUpdate | undefined {
        const updates = this._updates()
            .filter(u => u.workCommitmentId === commitmentId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return updates[0];
    }

    /** Get all updates for a commitment (chronological). */
    getUpdateHistory(commitmentId: string): ProgressUpdate[] {
        return this._updates()
            .filter(u => u.workCommitmentId === commitmentId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    /** Get the current hours done for a commitment. */
    getHoursDone(commitmentId: string): number {
        const latest = this.getLatestUpdate(commitmentId);
        return latest?.hoursCompleted ?? 0;
    }

    /** Get the current status for a commitment. */
    getStatus(commitmentId: string): TaskStatus {
        const latest = this.getLatestUpdate(commitmentId);
        return latest?.status ?? 'NotStarted';
    }

    /** Check if a commitment has over-hours (done > committed). */
    isOverHours(commitment: WorkCommitment): boolean {
        return this.getHoursDone(commitment.id) > commitment.committedHours;
    }

    // --- Member Progress Summaries ---

    /** Get progress summary for a specific member. */
    getMemberProgress(memberId: string): MemberProgressSummary {
        const member = this.teamService.getMemberById(memberId);
        const commitments = this.planService.getMemberCommitments(memberId);

        let totalCommitted = 0;
        let totalDone = 0;
        let tasksDone = 0;
        let blockedTasks = 0;

        for (const c of commitments) {
            totalCommitted += c.committedHours;
            const done = this.getHoursDone(c.id);
            totalDone += done;
            const status = this.getStatus(c.id);
            if (status === 'Done') tasksDone++;
            if (status === 'Blocked') blockedTasks++;
        }

        const progressPercent = totalCommitted > 0
            ? Math.round((totalDone / totalCommitted) * 100)
            : 0;

        return {
            member: member!,
            totalCommitted,
            totalDone,
            progressPercent,
            tasksDone,
            totalTasks: commitments.length,
            blockedTasks
        };
    }

    /** Get progress summaries for all selected members. */
    getAllMemberProgress(): MemberProgressSummary[] {
        const plan = this.planService.currentPlan();
        if (!plan) return [];
        return plan.selectedMemberIds.map(id => this.getMemberProgress(id));
    }

    // --- Overall / Category Summaries ---

    /** Get overall team progress percentage. */
    getOverallProgress(): number {
        const summaries = this.getAllMemberProgress();
        if (summaries.length === 0) return 0;

        const totalCommitted = summaries.reduce((s, m) => s + m.totalCommitted, 0);
        const totalDone = summaries.reduce((s, m) => s + m.totalDone, 0);

        return totalCommitted > 0 ? Math.round((totalDone / totalCommitted) * 100) : 0;
    }

    /** Get total tasks done across the team. */
    getTotalTasksDone(): number {
        return this.getAllMemberProgress().reduce((s, m) => s + m.tasksDone, 0);
    }

    /** Get total blocked tasks across the team. */
    getTotalBlocked(): number {
        return this.getAllMemberProgress().reduce((s, m) => s + m.blockedTasks, 0);
    }

    /** Get total tasks across the team. */
    getTotalTasks(): number {
        return this.getAllMemberProgress().reduce((s, m) => s + m.totalTasks, 0);
    }

    /** Get progress for a specific category. */
    getCategoryProgress(category: ItemCategory): { committed: number; done: number; percent: number } {
        const commitments = this.planService.commitments();
        let committed = 0;
        let done = 0;

        for (const c of commitments) {
            const item = this.backlogService.getItemById(c.backlogItemId);
            if (item?.category === category) {
                committed += c.committedHours;
                done += this.getHoursDone(c.id);
            }
        }

        const percent = committed > 0 ? Math.round((done / committed) * 100) : 0;
        return { committed, done, percent };
    }

    // --- Data Management ---

    /** Replace all progress data (used by data import). */
    setAll(updates: ProgressUpdate[]): void {
        this._updates.set(updates);
        this.saveToStorage();
    }

    /** Clear all progress data. */
    clear(): void {
        this._updates.set([]);
        this.saveToStorage();
    }

    /** Get all updates for archiving. */
    getAll(): ProgressUpdate[] {
        return [...this._updates()];
    }
}
