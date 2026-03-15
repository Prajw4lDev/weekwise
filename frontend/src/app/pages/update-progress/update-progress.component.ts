import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanService, BacklogService, UserContextService, ProgressService } from '../../services';
import { WorkCommitment, BacklogItem, ItemCategory, TaskStatus } from '../../models';

interface EditableCommitment extends WorkCommitment {
    item: BacklogItem;
    hoursDone: number;
    status: TaskStatus;
    notes: string;
}

/**
 * Update Progress screen.
 * Allows members to update hours, status, and notes for their weekly commitments.
 */
@Component({
    selector: 'app-update-progress',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './update-progress.component.html',
    styleUrl: './update-progress.component.css'
})
export class UpdateProgressComponent implements OnInit {
    private planService = inject(PlanService);
    private backlogService = inject(BacklogService);
    private userContext = inject(UserContextService);
    private progressService = inject(ProgressService);

    // Reactive State
    memberCommitments = signal<EditableCommitment[]>([]);

    // Computed Values
    totalCommitted = computed(() =>
        this.memberCommitments().reduce((sum, c) => sum + c.committedHours, 0)
    );

    totalDone = computed(() =>
        this.memberCommitments().reduce((sum, c) => sum + c.hoursDone, 0)
    );

    progressPercent = computed(() =>
        this.totalCommitted() > 0
            ? Math.round((this.totalDone() / this.totalCommitted()) * 100)
            : 0
    );

    ringDashoffset = computed(() => {
        const circumference = 326.7; // 2 * PI * 52 approx
        return circumference - (circumference * this.progressPercent() / 100);
    });

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        const memberId = this.userContext.currentUser()?.id;
        if (!memberId) return;

        const commitments = this.planService.getMemberCommitments(memberId);
        const editable = commitments.map(c => {
            const item = this.backlogService.getItemById(c.backlogItemId)!;
            const progress = this.progressService.getLatestUpdate(c.id);
            return {
                ...c,
                item,
                hoursDone: this.progressService.getHoursDone(c.id),
                status: this.progressService.getStatus(c.id),
                notes: progress?.notes ?? ''
            } as EditableCommitment;
        });

        this.memberCommitments.set(editable);
    }

    async saveAll() {
        const commitments = this.memberCommitments();
        for (const c of commitments) {
            await this.progressService.updateProgress(c.id, c.hoursDone, c.status, c.notes);
        }
        // Refresh data to ensure UI is in sync with service
        this.loadData();
    }

    getCategoryLabel(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return '🟢 Client';
            case 'TechDebt': return '🟡 Tech Debt';
            case 'RnD': return '🔵 R&D';
            default: return cat;
        }
    }

    getCategoryClass(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return 'badge-client';
            case 'TechDebt': return 'badge-techdebt';
            case 'RnD': return 'badge-rnd';
            default: return '';
        }
    }
}
