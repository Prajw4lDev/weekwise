import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserContextService, PlanService, DashboardService } from '../../services';
import { DashboardMember } from '../../models';
import { CommonModule } from '@angular/common';

/**
 * Home dashboard for regular team members.
 * Shows personal progress analytics and actions.
 */
@Component({
    selector: 'app-home-member',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home-member.component.html',
    styleUrl: './home-member.component.css'
})
export class HomeMemberComponent implements OnInit {
    private router = inject(Router);
    userContext = inject(UserContextService);
    planService = inject(PlanService);
    dashboardService = inject(DashboardService);

    memberStats = signal<DashboardMember | null>(null);

    ngOnInit() {
        if (this.planService.hasActivePlan()) {
            this.loadMemberStats();
        }
    }

    loadMemberStats() {
        const userId = this.userContext.currentUser()?.id;
        if (!userId) return;

        this.dashboardService.getMembers().subscribe(members => {
            const me = members.find(m => m.memberId === userId);
            if (me) this.memberStats.set(me);
        });
    }

    goto(route: string): void {
        this.router.navigate([route]);
    }

    get userName(): string {
        return this.userContext.currentUser()?.name ?? 'Member';
    }
}
