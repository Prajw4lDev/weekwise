import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Home dashboard for regular team members.
 * Shows a subset of actions (Plan, Update, Progress).
 */
@Component({
    selector: 'app-home-member',
    templateUrl: './home-member.component.html',
    styleUrl: './home-member.component.css'
})
export class HomeMemberComponent {
    constructor(private router: Router) { }

    goto(route: string): void {
        this.router.navigate([route]);
    }
}
