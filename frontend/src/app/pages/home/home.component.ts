import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserContextService, PlanService, DashboardService } from '../../services';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DashboardAnalyticsComponent } from '../dashboard-analytics/dashboard-analytics.component';

/**
 * Home dashboard for the Team Lead (Admin).
 * Shows all available actions based on current plan status,
 * and visual analytics (charts).
 */
@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, DashboardAnalyticsComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    private router = inject(Router);
    userContext = inject(UserContextService);
    planService = inject(PlanService);
    authService = inject(AuthService);
    dashboardService = inject(DashboardService);

    statusMessage = '';

    goto(route: string): void {
        this.router.navigate([route]);
    }

    get userName(): string {
        return this.userContext.currentUser()?.name ?? 'Leader';
    }

    /** Cancel the current plan. */
    async cancelPlan(): Promise<void> {
        if (!confirm('Are you sure you want to cancel this week\'s plan? This will erase all commitments.')) return;
        try {
            await this.planService.cancelPlan();
            this.statusMessage = 'Plan cancelled successfully.';
            setTimeout(() => this.statusMessage = '', 3000);
        } catch (e) {
            this.statusMessage = 'Failed to cancel plan.';
        }
    }

    /** Complete the current frozen plan. */
    async completePlan(): Promise<void> {
        if (!confirm('Are you sure you want to finish this week? This will archive the plan.')) return;
        try {
            await this.planService.completePlan();
            this.statusMessage = 'Week completed and archived!';
            setTimeout(() => this.statusMessage = '', 3000);
        } catch (e) {
            this.statusMessage = 'Failed to complete plan.';
        }
    }
}
