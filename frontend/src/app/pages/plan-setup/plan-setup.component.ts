import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Weekly plan setup screen (Lead only). */
@Component({
    selector: 'app-plan-setup',
    templateUrl: './plan-setup.component.html',
    styleUrl: './plan-setup.component.css'
})
export class PlanSetupComponent {
    constructor(private router: Router) { }

    savePlan(): void {
        this.router.navigate(['/home']);
    }
}
