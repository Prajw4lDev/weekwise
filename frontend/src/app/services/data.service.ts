import { Injectable, inject } from '@angular/core';
import { PastWeekRecord, WeeklyPlan, WorkCommitment, ProgressUpdate, BacklogItem, TeamMember } from '../models';
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

    constructor() {
        this.initializeDataIfEmpty();
    }

    private initializeDataIfEmpty() {
        const team = localStorage.getItem('weekwise-team');
        if (!team || JSON.parse(team).length === 0 || team.includes('Rahul Sharma')) {
            this.seedDemoData();
        }
    }

    // --- Past Weeks ---

    getPastWeeks(): PastWeekRecord[] {
        const data = localStorage.getItem(this.PAST_WEEKS_KEY);
        return data ? JSON.parse(data) : [];
    }

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
        pastWeeks.unshift(record);
        localStorage.setItem(this.PAST_WEEKS_KEY, JSON.stringify(pastWeeks));
    }

    // --- Export / Import ---

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

    seedDemoData(): void {
        this.resetAll();

        // 1. Team Members
        const members: TeamMember[] = [
            { id: '1', name: 'Prajwal Dinde', email: 'prajwal@demo.com', role: 'Admin', isActive: true, weeklyCapacityHours: 40 },
            { id: '2', name: 'Ajay more', email: 'ajay@demo.com', role: 'Member', isActive: true, weeklyCapacityHours: 40 },
            { id: '3', name: 'Om Patil', email: 'om@demo.com', role: 'Member', isActive: true, weeklyCapacityHours: 40 },
            { id: '4', name: 'Yash Gaikwad', email: 'yash@demo.com', role: 'Member', isActive: true, weeklyCapacityHours: 40 },
            { id: '5', name: 'Jay Sharma', email: 'jay@demo.com', role: 'Member', isActive: true, weeklyCapacityHours: 40 }
        ];
        this.teamService.setAll(members);

        // 2. Backlog Items
        const backlog: BacklogItem[] = [
            { id: 'b1', title: 'Implement User Login API', description: 'Priority: High. Assigned loosely to Rahul.', category: 'Client', estimatedHours: 12, isArchived: false },
            { id: 'b2', title: 'Fix Payment Gateway Bug', description: 'Priority: Medium. Assigned loosely to Priya.', category: 'TechDebt', estimatedHours: 8, isArchived: false },
            { id: 'b3', title: 'Design Dashboard Layout', description: 'Priority: Low. Assigned loosely to Sneha.', category: 'RnD', estimatedHours: 10, isArchived: false },
            { id: 'b4', title: 'Write API Unit Tests', description: 'Priority: High. Assigned loosely to Amit.', category: 'Client', estimatedHours: 6, isArchived: false },
            { id: 'b5', title: 'Setup CI/CD Pipeline', description: 'Priority: Medium. Assigned loosely to Arjun.', category: 'TechDebt', estimatedHours: 14, isArchived: false },

            // Adding specific tasks mentioned in the weekly plan to avoid mismatch
            { id: 'b6', title: 'Frontend Login Page', description: 'Mar 2 Plan task', category: 'Client', estimatedHours: 16, isArchived: false },
            { id: 'b7', title: 'Authentication API', description: 'Mar 2 Plan task', category: 'Client', estimatedHours: 20, isArchived: false },
            { id: 'b8', title: 'API Testing', description: 'Mar 2 Plan task', category: 'TechDebt', estimatedHours: 12, isArchived: false },
            { id: 'b9', title: 'Dashboard UI Design', description: 'Mar 2 Plan task', category: 'RnD', estimatedHours: 16, isArchived: false },
            { id: 'b10', title: 'Deploy Backend to Server', description: 'Mar 2 Plan task', category: 'TechDebt', estimatedHours: 16, isArchived: false }
        ];
        this.backlogService.setAll(backlog);

        // 3. Weekly Plan Data
        const currentPlan: WeeklyPlan = {
            id: 'plan-current',
            weekStartDate: new Date('2026-03-02').toISOString(),
            workPeriodStart: new Date('2026-03-03').toISOString(),
            workPeriodEnd: new Date('2026-03-09').toISOString(),
            status: 'Frozen', // Because it has progress/execution happening
            totalHours: 80,
            selectedMemberIds: ['1', '2', '3', '4', '5'],
            clientPercent: 50,
            techDebtPercent: 30,
            rndPercent: 20
        };

        const commitments: WorkCommitment[] = [
            { id: 'c1', weeklyPlanId: 'plan-current', memberId: '1', backlogItemId: 'b6', committedHours: 16 },
            { id: 'c2', weeklyPlanId: 'plan-current', memberId: '2', backlogItemId: 'b7', committedHours: 20 },
            { id: 'c3', weeklyPlanId: 'plan-current', memberId: '3', backlogItemId: 'b8', committedHours: 12 },
            { id: 'c4', weeklyPlanId: 'plan-current', memberId: '4', backlogItemId: 'b9', committedHours: 16 },
            { id: 'c5', weeklyPlanId: 'plan-current', memberId: '5', backlogItemId: 'b10', committedHours: 16 }
        ];
        this.planService.setAll(currentPlan, commitments);

        // 4. Team Progress Data
        const updates: ProgressUpdate[] = [
            // Prajwal Dinde: assigned 16, done 8, In Progress (status 'InProgress')
            { id: 'u1', workCommitmentId: 'c1', hoursCompleted: 8, status: 'InProgress', notes: 'Initial setup done.', updatedAt: new Date().toISOString() },
            // Ajay more: assigned 20, done 12, In Progress (status 'InProgress')
            { id: 'u2', workCommitmentId: 'c2', hoursCompleted: 12, status: 'InProgress', notes: 'API endpoints created.', updatedAt: new Date().toISOString() },
            // Om Patil: assigned 12, done 4, Pending (status 'NotStarted' or 'Blocked') Let's use 'NotStarted' to map to pending
            { id: 'u3', workCommitmentId: 'c3', hoursCompleted: 4, status: 'NotStarted', notes: 'Just started planning tests.', updatedAt: new Date().toISOString() },
            // Yash Gaikwad: assigned 16, done 16, Completed (status 'Done')
            { id: 'u4', workCommitmentId: 'c4', hoursCompleted: 16, status: 'Done', notes: 'Design approved and delivered.', updatedAt: new Date().toISOString() },
            // Jay Sharma: assigned 16, done 6, Pending (status 'NotStarted')
            { id: 'u5', workCommitmentId: 'c5', hoursCompleted: 6, status: 'NotStarted', notes: 'Server provisioned, pending deploy.', updatedAt: new Date().toISOString() }
        ];
        this.progressService.setAll(updates);

        // 5. Past Weeks Data
        const pastWeeks: PastWeekRecord[] = [
            {
                weeklyPlan: { id: 'old-2', weekStartDate: new Date('2026-02-23').toISOString(), workPeriodStart: '', workPeriodEnd: '', status: 'Completed', totalHours: 78, selectedMemberIds: [], clientPercent: 50, techDebtPercent: 30, rndPercent: 20 },
                commitments: [],
                progressUpdates: [],
                backlogSnapshot: [],
                members: [],
                completedAt: new Date('2026-03-01').toISOString()
            },
            {
                weeklyPlan: { id: 'old-1', weekStartDate: new Date('2026-02-16').toISOString(), workPeriodStart: '', workPeriodEnd: '', status: 'Completed', totalHours: 82, selectedMemberIds: [], clientPercent: 50, techDebtPercent: 30, rndPercent: 20 },
                commitments: [],
                progressUpdates: [],
                backlogSnapshot: [],
                members: [],
                completedAt: new Date('2026-02-22').toISOString()
            }
        ];
        localStorage.setItem(this.PAST_WEEKS_KEY, JSON.stringify(pastWeeks));
    }

    // --- Reset ---

    resetAll(): void {
        this.teamService.setAll([]);
        this.backlogService.setAll([]);
        this.planService.setAll(null, []);
        this.progressService.clear();
        localStorage.removeItem(this.PAST_WEEKS_KEY);
    }
}
