import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserContextService } from '../../services';

/**
 * Home dashboard for regular team members.
 * Shows a subset of actions depending on plan status.
 */
@Component({
    selector: 'app-home-member',
    templateUrl: './home-member.component.html',
    styleUrl: './home-member.component.css'
})
export class HomeMemberComponent {
    private router = inject(Router);
    userContext = inject(UserContextService);

    goto(route: string): void {
        this.router.navigate([route]);
    }

    get userName(): string {
        return this.userContext.currentUser()?.name ?? 'Member';
    }
}
