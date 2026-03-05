import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserContextService } from '../../services/user-context.service';
import { PlanService } from '../../services/plan.service';
import { ProgressService } from '../../services/progress.service';
import { BacklogService } from '../../services/backlog.service';
import { WorkCommitment, TaskStatus, BacklogItem } from '../../models';

/** Update personal progress on committed tasks. */
@Component({
    selector: 'app-update-progress',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './update-progress.component.html',
    styleUrl: './update-progress.component.css'
})
export class UpdateProgressComponent implements OnInit {
    private userContext = inject(UserContextService);
    private planService = inject(PlanService);
    private progressService = inject(ProgressService);
    private backlogService = inject(BacklogService);

    // Current member's commitments enriched with local update state
    memberCommitments = signal<(WorkCommitment & { item: BacklogItem; hoursDone: number; status: TaskStatus; notes: string })[]>([]);

    // Overall progress summary for the current user
    totalCommitted = computed(() => this.memberCommitments().reduce((sum, c) => sum + c.committedHours, 0));
    totalDone = computed(() => this.memberCommitments().reduce((sum, c) => sum + c.hoursDone, 0));
    progressPercent = computed(() => this.totalCommitted() > 0 ? Math.round((this.totalDone() / this.totalCommitted()) * 100) : 0);

    ngOnInit(): void {
        const user = this.userContext.currentUser();
        if (!user) return;

        // Fetch commitments assigned to the current user
        const commitments = this.planService.getMemberCommitments(user.id);

        // Enrich them with backlog item details and the latest progress from storage
        const enriched = commitments.map(c => {
            const item = this.backlogService.getItemById(c.backlogItemId)!;
            const latest = this.progressService.getLatestUpdate(c.id);
            return {
                ...c,
                item,
                hoursDone: latest?.hoursCompleted ?? 0,
                status: latest?.status ?? 'NotStarted',
                notes: latest?.notes ?? ''
            };
        });

        this.memberCommitments.set(enriched);
    }

    /** TrackBy function for *ngFor optimization. */
    trackById(index: number, item: any): string {
        return item.id;
    }

    /** Save all latest progress updates to the local service. */
    saveAll(): void {
        for (const c of this.memberCommitments()) {
            this.progressService.updateProgress(c.id, c.hoursDone, c.status, c.notes);
        }
        alert('All progress saved successfully!');
    }
}
