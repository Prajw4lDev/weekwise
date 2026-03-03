import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Welcome/Team Setup screen.
 * Allows adding team members and assigning a lead.
 */
@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
    constructor(private router: Router) { }

    /** Navigate to the login screen. */
    continue(): void {
        this.router.navigate(['/login']);
    }
}
