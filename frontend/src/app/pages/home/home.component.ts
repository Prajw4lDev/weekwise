import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
    constructor(private router: Router) { }

    /** Navigate to a given route. */
    goto(route: string): void {
        this.router.navigate([route]);
    }
}
