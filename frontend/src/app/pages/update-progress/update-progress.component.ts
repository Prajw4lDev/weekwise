import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanService, BacklogService, UserContextService, ProgressService } from '../../services';
import { WorkCommitment, BacklogItem, ItemCategory, TaskStatus } from '../../models';

/**
 * Update My Progress screen.
 * Shows all committed tasks with fields for hours done, status, and notes.
 */
@Component({
    selector: 'app-update-progress',
    imports: [FormsModule],
    templateUrl: './update-progress.component.html',
    styleUrl: './update-progress.component.css'
})
export class UpdateProgressComponent {
    planService = inject(PlanService);
    backlogService = inject(BacklogService);
    userContext = inject(UserContextService);
    progressService = inject(ProgressService);

    /** Local form state for each commitment. */
    formData: Map<string, { hours: number; status: TaskStatus; notes: string }> = new Map();

    get memberId(): string {
        return this.userContext.currentUser()?.id ?? '';
    }

    get myCommitments(): WorkCommitment[] {
        return this.planService.getMemberCommitments(this.memberId);
    }

    get totalCommitted(): number {
        return this.myCommitments.reduce((s, c) => s + c.committedHours, 0);
    }

    get totalDone(): number {
        return this.myCommitments.reduce((s, c) => s + this.getHours(c.id), 0);
    }

    get progressPercent(): number {
        return this.totalCommitted > 0 ? Math.round((this.totalDone / this.totalCommitted) * 100) : 0;
    }

    /** Get the backlog item for a commitment. */
    getItem(backlogItemId: string): BacklogItem | undefined {
        return this.backlogService.getItemById(backlogItemId);
    }

    /** Get current hours for a commitment (from form or from service). */
    getHours(commitmentId: string): number {
        if (this.formData.has(commitmentId)) {
            return this.formData.get(commitmentId)!.hours;
        }
        return this.progressService.getHoursDone(commitmentId);
    }

    /** Get current status for a commitment. */
    getStatus(commitmentId: string): TaskStatus {
        if (this.formData.has(commitmentId)) {
            return this.formData.get(commitmentId)!.status;
        }
        return this.progressService.getStatus(commitmentId);
    }

    /** Get notes for a commitment. */
    getNotes(commitmentId: string): string {
        if (this.formData.has(commitmentId)) {
            return this.formData.get(commitmentId)!.notes;
        }
        const latest = this.progressService.getLatestUpdate(commitmentId);
        return latest?.notes ?? '';
    }

    /** Track form changes. */
    updateFormField(commitmentId: string, field: 'hours' | 'status' | 'notes', value: any): void {
        if (!this.formData.has(commitmentId)) {
            this.formData.set(commitmentId, {
                hours: this.progressService.getHoursDone(commitmentId),
                status: this.progressService.getStatus(commitmentId),
                notes: this.progressService.getLatestUpdate(commitmentId)?.notes ?? ''
            });
        }
        const data = this.formData.get(commitmentId)!;
        if (field === 'hours') data.hours = value;
        if (field === 'status') data.status = value;
        if (field === 'notes') data.notes = value;
    }

    /** Is over-hours for a commitment? */
    isOverHours(commitment: WorkCommitment): boolean {
        return this.getHours(commitment.id) > commitment.committedHours;
    }

    /** Save all progress updates. */
    saveAll(): void {
        for (const commitment of this.myCommitments) {
            const hours = this.getHours(commitment.id);
            const status = this.getStatus(commitment.id);
            const notes = this.getNotes(commitment.id);
            this.progressService.updateProgress(commitment.id, hours, status, notes);
        }
        this.formData.clear();
    }

    /** SVG ring dashoffset for progress circle. */
    get ringDashoffset(): number {
        const circumference = 2 * Math.PI * 52; // r=52
        return circumference - (circumference * this.progressPercent) / 100;
    }

    /** Category helpers. */
    getCategoryLabel(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return '🟢 Client';
            case 'TechDebt': return '🟡 Tech Debt';
            case 'RnD': return '🔵 R&D';
        }
    }

    getCategoryClass(cat: ItemCategory): string {
        switch (cat) {
            case 'Client': return 'badge-client';
            case 'TechDebt': return 'badge-techdebt';
            case 'RnD': return 'badge-rnd';
        }
    }

    /** Status options for dropdown. */
    statusOptions: { value: TaskStatus; label: string }[] = [
        { value: 'NotStarted', label: 'Not Started' },
        { value: 'InProgress', label: 'In Progress' },
        { value: 'Done', label: 'Done' },
        { value: 'Blocked', label: 'Blocked' },
    ];
}
