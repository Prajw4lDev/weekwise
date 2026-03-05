import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService, BacklogService, ProgressService, TeamService } from '../../services';
import { WorkCommitment, BacklogItem, ProgressUpdate, ItemCategory, TaskStatus } from '../../models';

/**
 * Task Detail view — shows a backlog item's full info, all assignees, and update timeline.
 * For now uses the first commitment's item as a demo. Will use route params later.
 */
@Component({
    selector: 'app-task-detail',
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
    private router = inject(Router);
    planService = inject(PlanService);
    backlogService = inject(BacklogService);
    progressService = inject(ProgressService);
    teamService = inject(TeamService);

    /** Get all commitments grouped by backlog item. */
    get allCommitments(): WorkCommitment[] {
        return this.planService.commitments();
    }

    /** Get unique backlog items that have commitments. */
    get committedItems(): BacklogItem[] {
        const itemIds = new Set(this.allCommitments.map(c => c.backlogItemId));
        return Array.from(itemIds)
            .map(id => this.backlogService.getItemById(id))
            .filter((i): i is BacklogItem => !!i);
    }

    /** Get commitments for a specific backlog item. */
    getCommitmentsForItem(itemId: string): WorkCommitment[] {
        return this.allCommitments.filter(c => c.backlogItemId === itemId);
    }

    /** Get member name by ID. */
    getMemberName(memberId: string): string {
        return this.teamService.getMemberById(memberId)?.name ?? 'Unknown';
    }

    /** Get member initial. */
    getMemberInitial(memberId: string): string {
        return this.getMemberName(memberId).charAt(0).toUpperCase();
    }

    /** Get overall status for a commitment. */
    getTaskStatus(commitmentId: string): TaskStatus {
        return this.progressService.getStatus(commitmentId);
    }

    /** Get hours done for a commitment. */
    getHoursDone(commitmentId: string): number {
        return this.progressService.getHoursDone(commitmentId);
    }

    /** Get update history for all commitments of an item. */
    getItemHistory(itemId: string): (ProgressUpdate & { memberName: string })[] {
        const commitments = this.getCommitmentsForItem(itemId);
        const allUpdates: (ProgressUpdate & { memberName: string })[] = [];
        for (const c of commitments) {
            const updates = this.progressService.getUpdateHistory(c.id);
            for (const u of updates) {
                allUpdates.push({ ...u, memberName: this.getMemberName(c.memberId) });
            }
        }
        return allUpdates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    /** Get a formatted date string. */
    formatDate(iso: string): string {
        return new Date(iso).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    }

    /** Status badge class. */
    getStatusClass(status: TaskStatus): string {
        switch (status) {
            case 'Done': return 'status-done';
            case 'InProgress': return 'status-inprogress';
            case 'Blocked': return 'status-blocked';
            default: return '';
        }
    }

    /** Status label. */
    getStatusLabel(status: TaskStatus): string {
        switch (status) {
            case 'NotStarted': return '○ Not Started';
            case 'InProgress': return '● In Progress';
            case 'Done': return '● Done';
            case 'Blocked': return '● Blocked';
        }
    }

    /** Category helpers. */
    getCategoryLabel(cat: ItemCategory): string {
        switch (cat) { case 'Client': return '🟢 Client'; case 'TechDebt': return '🟡 Tech Debt'; case 'RnD': return '🔵 R&D'; }
    }
    getCategoryClass(cat: ItemCategory): string {
        switch (cat) { case 'Client': return 'badge-client'; case 'TechDebt': return 'badge-techdebt'; case 'RnD': return 'badge-rnd'; }
    }
    getGradient(index: number): string {
        const g = ['linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#3b82f6,#06b6d4)', 'linear-gradient(135deg,#f59e0b,#ef4444)', 'linear-gradient(135deg,#10b981,#059669)', 'linear-gradient(135deg,#ec4899,#f43f5e)'];
        return g[index % g.length];
    }

    goBack(): void {
        this.router.navigate(['/progress']);
    }
}
