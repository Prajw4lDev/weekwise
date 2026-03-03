import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserContextService, PlanService } from '../../services';

/**
 * Home dashboard for the Team Lead.
 * Shows all available actions based on current plan status.
 */
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    private router = inject(Router);
    userContext = inject(UserContextService);
    planService = inject(PlanService);

    goto(route: string): void {
        this.router.navigate([route]);
    }

    /** Get the user's display name. */
    get userName(): string {
        return this.userContext.currentUser()?.name ?? 'Leader';
    }
}
