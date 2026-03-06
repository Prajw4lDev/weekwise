import { Injectable, signal, inject, effect } from '@angular/core';
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
 * Uses localStorage instead of .NET Backend API.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
    private readonly STORAGE_KEY = 'weekwise-progress';

    private planService = inject(PlanService);
    private backlogService = inject(BacklogService);
    private teamService = inject(TeamService);

    /** All progress updates for the current plan (latest per commitment). */
    private _updates = signal<ProgressUpdate[]>([]);

    readonly updates = this._updates.asReadonly();

    constructor() {
        // Automatically reload progress whenever the current plan changes
        effect(() => {
            const plan = this.planService.currentPlan();
            if (plan && plan.status === 'Frozen') {
                this.loadAllLatestProgress();
            } else {
                this._updates.set([]);
            }
        });
    }

    private saveUpdates(updates: ProgressUpdate[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updates));
    }

    /** Load latest progress for all commitments of the current plan. */
    async loadAllLatestProgress(): Promise<void> {
        const commitments = this.planService.commitments();
        if (commitments.length === 0) return;

        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            const allUpdates: ProgressUpdate[] = JSON.parse(stored);
            // Only keep updates for current commitments
            const validUpdates = allUpdates.filter(u => commitments.some(c => c.id === u.workCommitmentId));
            this._updates.set(validUpdates);
        }
    }

    /** Get all current updates in memory (used by DataService). */
    getAll(): ProgressUpdate[] {
        return this._updates();
    }

    /** Bulk set updates (used by DataService). */
    setAll(updates: ProgressUpdate[]): void {
        this._updates.set(updates);
        this.saveUpdates(updates);
    }

    /** Clear all updates (used by DataService). */
    clear(): void {
        this._updates.set([]);
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // --- Progress Updates ---

    /** Update progress on a commitment. */
    async updateProgress(commitmentId: string, hoursCompleted: number, status: TaskStatus, notes: string): Promise<ProgressUpdate> {
        const update: ProgressUpdate = {
            id: Date.now().toString(),
            workCommitmentId: commitmentId,
            hoursCompleted,
            status,
            notes: notes.trim(),
            updatedAt: new Date().toISOString()
        };

        this._updates.update(u => {
            const filtered = u.filter(x => x.workCommitmentId !== commitmentId);
            const updated = [...filtered, update];
            this.saveUpdates(updated);
            return updated;
        });

        return update;
    }

    /** Get the latest progress update for a commitment from local signal. */
    getLatestUpdate(commitmentId: string): ProgressUpdate | undefined {
        return this._updates().find(u => u.workCommitmentId === commitmentId);
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
}
