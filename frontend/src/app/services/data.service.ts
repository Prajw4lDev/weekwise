import { Injectable, inject } from '@angular/core';
import { PastWeekRecord } from '../models';
import { TeamService } from './team.service';
import { BacklogService } from './backlog.service';
import { PlanService } from './plan.service';
import { ProgressService } from './progress.service';

/**
 * Service for data export/import, past weeks archiving, and seeding demo data.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
    private readonly PAST_WEEKS_KEY = 'weekwise-past-weeks';

    private teamService = inject(TeamService);
    private backlogService = inject(BacklogService);
    private planService = inject(PlanService);
    private progressService = inject(ProgressService);

    // --- Past Weeks ---

    /** Get all past week records. */
    getPastWeeks(): PastWeekRecord[] {
        const data = localStorage.getItem(this.PAST_WEEKS_KEY);
        return data ? JSON.parse(data) : [];
    }

    /** Archive the current completed plan as a past week record. */
    archiveCurrentWeek(): void {
        const plan = this.planService.currentPlan();
        if (!plan) return;

        const record: PastWeekRecord = {
            weeklyPlan: plan,
            commitments: [...this.planService.commitments()],
            progressUpdates: this.progressService.getAll(),
            backlogSnapshot: [...this.backlogService.items()],
            members: [...this.teamService.members()],
            completedAt: new Date().toISOString()
        };

        const pastWeeks = this.getPastWeeks();
        pastWeeks.unshift(record); // Most recent first
        localStorage.setItem(this.PAST_WEEKS_KEY, JSON.stringify(pastWeeks));
    }

    // --- Export / Import ---

    /** Export ALL app data as a JSON string. */
    exportData(): string {
        const data = {
            version: 1,
            exportedAt: new Date().toISOString(),
            team: this.teamService.members(),
            backlog: this.backlogService.items(),
            plan: this.planService.currentPlan(),
            commitments: this.planService.commitments(),
            progress: this.progressService.getAll(),
            pastWeeks: this.getPastWeeks()
        };
        return JSON.stringify(data, null, 2);
    }

    /** Download the export as a JSON file. */
    downloadExport(): void {
        const json = this.exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weekwise-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /** Import data from a JSON string. Replaces ALL current data. */
    importData(json: string): boolean {
        try {
            const data = JSON.parse(json);
            if (!data.version) return false;

            this.teamService.setAll(data.team || []);
            this.backlogService.setAll(data.backlog || []);
            this.planService.setAll(data.plan || null, data.commitments || []);
            this.progressService.setAll(data.progress || []);
            if (data.pastWeeks) {
                localStorage.setItem(this.PAST_WEEKS_KEY, JSON.stringify(data.pastWeeks));
            }
            return true;
        } catch {
            return false;
        }
    }

    // --- Seed Demo Data ---

    /** Seed the app with sample data for testing. */
    seedDemoData(): void {
        // Add team members
        const alice = this.teamService.addMember('Alice', 'Lead');
        const bob = this.teamService.addMember('Bob', 'Member');
        const charlie = this.teamService.addMember('Charlie', 'Member');

        // Add backlog items
        this.backlogService.addItem('API Redesign', 'Redesign the REST API for v2 compatibility.', 'Client', 10);
        this.backlogService.addItem('Dashboard Analytics', 'Build interactive charts for the analytics page.', 'Client', 12);
        this.backlogService.addItem('Refactor DB Layer', 'Migrate from raw SQL to ORM patterns.', 'TechDebt', 8);
        this.backlogService.addItem('CI/CD Pipeline Setup', 'Automate build and deployment pipeline.', 'TechDebt', 5);
        this.backlogService.addItem('ML Model POC', 'Proof of concept for recommendation engine.', 'RnD', 6);
        this.backlogService.addItem('Caching Layer', 'Implement Redis caching for hot data.', 'TechDebt', 7);
    }

    // --- Reset ---

    /** Clear ALL app data. */
    resetAll(): void {
        this.teamService.setAll([]);
        this.backlogService.setAll([]);
        this.planService.setAll(null, []);
        this.progressService.clear();
        localStorage.removeItem(this.PAST_WEEKS_KEY);
    }
}
