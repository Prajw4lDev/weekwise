import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardOverview, DashboardCategory, DashboardMember, DashboardTrend } from '../models';
import { PlanService } from './plan.service';
import { ProgressService } from './progress.service';
import { TeamService } from './team.service';
import { BacklogService } from './backlog.service';

/**
 * Service for fetching dashboard analytics and statistics.
 * Computes metrics locally instead of querying a backend API.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
    private planService = inject(PlanService);
    private progressService = inject(ProgressService);
    private teamService = inject(TeamService);
    private backlogService = inject(BacklogService);

    /** Get overall progress and task counts. */
    getOverview(): Observable<DashboardOverview> {
        const plan = this.planService.currentPlan();
        const overallProgressPercentage = this.progressService.getOverallProgress();
        const totalTasksCount = this.progressService.getTotalTasks();
        const completedTasksCount = this.progressService.getTotalTasksDone();
        const blockedTasksCount = this.progressService.getTotalBlocked();
        const totalMembersCount = this.teamService.activeMembers().length;
        const totalBacklogTasksCount = this.backlogService.activeItems().length;
        const totalPlannedHours = plan?.totalHours || 0;

        return of({
            overallProgressPercentage,
            totalTasksCount,
            completedTasksCount,
            blockedTasksCount,
            totalMembersCount,
            totalBacklogTasksCount,
            totalPlannedHours
        });
    }

    /** Get progress breakdown by category. */
    getCategories(): Observable<DashboardCategory[]> {
        const budgets = this.planService.getAllCategoryBudgets();

        const results: DashboardCategory[] = budgets.map(b => {
            const prog = this.progressService.getCategoryProgress(b.category);
            return {
                category: b.category,
                budgetHours: b.budgetHours,
                committedHours: b.claimedHours,
                completedHours: prog.done,
                progressPercentage: prog.percent
            };
        });

        return of(results);
    }

    /** Get progress summary for each member. */
    getMembers(): Observable<DashboardMember[]> {
        const summaries = this.progressService.getAllMemberProgress();
        const results: DashboardMember[] = summaries.map(s => ({
            memberId: s.member.id,
            name: s.member.name,
            totalCommittedHours: s.totalCommitted,
            totalCompletedHours: s.totalDone,
            progressPercentage: s.progressPercent
        }));

        return of(results);
    }

    /** Get weekly progress trend. */
    getTrend(): Observable<DashboardTrend[]> {
        // Mock weekly trend since we don't have daily granular data stored locally
        const totalDone = this.progressService.getAllMemberProgress()
            .reduce((s, m) => s + m.totalDone, 0);

        // Distribute the total completed hours across 5 working days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const results: DashboardTrend[] = days.map((day, i) => {
            const percent = [0.15, 0.25, 0.30, 0.20, 0.10][i];
            const completed = Math.round(totalDone * percent);
            return { label: day, completedHours: completed };
        });

        // Adjust the last day to ensure the sum matches exactly totalDone
        const sumSoFar = results.reduce((acc, curr) => acc + curr.completedHours, 0);
        const diff = totalDone - sumSoFar;
        if (results.length > 0) {
            results[results.length - 1].completedHours += diff;
            if (results[results.length - 1].completedHours < 0) {
                results[results.length - 1].completedHours = 0;
            }
        }

        return of(results);
    }
}
