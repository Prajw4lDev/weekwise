import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Login screen — "Who are you?"
 * Displays team member cards; clicking one navigates to the home dashboard.
 */
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    constructor(private router: Router) { }

    /** Select a user and navigate to the appropriate home dashboard. */
    selectUser(role: string): void {
        if (role === 'lead') {
            this.router.navigate(['/home']);
        } else {
            this.router.navigate(['/home-member']);
        }
    }
}
