import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService, PlanService } from '../../services';
import { TeamMember } from '../../models';

/**
 * Weekly plan setup screen (Lead only).
 * Step 1: Select team members for this week.
 * Step 2: Set category budget percentages (must total 100%).
 * Step 3: Save → creates/updates plan and moves to Planning status.
 */
@Component({
    selector: 'app-plan-setup',
    imports: [FormsModule],
    templateUrl: './plan-setup.component.html',
    styleUrl: './plan-setup.component.css'
})
export class PlanSetupComponent implements OnInit {
    private router = inject(Router);
    teamService = inject(TeamService);
    planService = inject(PlanService);

    /** Which members are selected for this week. */
    selectedMemberIds: Set<string> = new Set();

    /** Category percentage inputs. */
    clientPercent = 50;
    techDebtPercent = 30;
    rndPercent = 20;

    ngOnInit(): void {
        // If no active plan, create one
        if (!this.planService.hasActivePlan()) {
            this.planService.createPlan();
        }

        // Pre-select all active members
        const plan = this.planService.currentPlan();
        if (plan && plan.selectedMemberIds.length > 0) {
            // Restore from existing plan
            plan.selectedMemberIds.forEach(id => this.selectedMemberIds.add(id));
            this.clientPercent = plan.clientPercent || 50;
            this.techDebtPercent = plan.techDebtPercent || 30;
            this.rndPercent = plan.rndPercent || 20;
        } else {
            // Default: select all active members
            this.teamService.activeMembers().forEach(m => this.selectedMemberIds.add(m.id));
        }
    }

    /** Toggle member selection. */
    toggleMember(memberId: string): void {
        if (this.selectedMemberIds.has(memberId)) {
            this.selectedMemberIds.delete(memberId);
        } else {
            this.selectedMemberIds.add(memberId);
        }
    }

    /** Is a member selected? */
    isMemberSelected(memberId: string): boolean {
        return this.selectedMemberIds.has(memberId);
    }

    /** Number of selected members. */
    get selectedCount(): number {
        return this.selectedMemberIds.size;
    }

    /** Total hours for the team (selected members × 30). */
    get totalHours(): number {
        return this.selectedCount * PlanService.HOURS_PER_MEMBER;
    }

    /** Category percent total. */
    get percentTotal(): number {
        return (this.clientPercent || 0) + (this.techDebtPercent || 0) + (this.rndPercent || 0);
    }

    /** Is the total exactly 100%? */
    get isPercentValid(): boolean {
        return this.percentTotal === 100;
    }

    /** Calculated hours for Client category. */
    get clientHours(): number {
        return Math.round((this.totalHours * (this.clientPercent || 0)) / 100);
    }

    /** Calculated hours for Tech Debt category. */
    get techDebtHours(): number {
        return Math.round((this.totalHours * (this.techDebtPercent || 0)) / 100);
    }

    /** Calculated hours for R&D category. */
    get rndHours(): number {
        return Math.round((this.totalHours * (this.rndPercent || 0)) / 100);
    }

    /** Can we save the plan setup? */
    get canSave(): boolean {
        return this.selectedCount >= 1 && this.isPercentValid;
    }

    /** Save and move the plan from Setup to Planning. */
    savePlan(): void {
        if (!this.canSave) return;

        this.planService.setupPlan(
            Array.from(this.selectedMemberIds),
            this.clientPercent,
            this.techDebtPercent,
            this.rndPercent
        );

        this.router.navigate(['/home']);
    }
}
