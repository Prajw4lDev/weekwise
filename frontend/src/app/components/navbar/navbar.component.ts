import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Shared navbar component displayed on every page.
 * Shows the app logo, current user info, theme toggle, and home button.
 */
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    constructor(private router: Router) { }

    /** Navigate to the home dashboard. */
    goHome(): void {
        this.router.navigate(['/home']);
    }

    /** Navigate to the login/user-select screen. */
    switchUser(): void {
        this.router.navigate(['/login']);
    }
}
