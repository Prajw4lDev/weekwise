import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Member's personal work planning screen. */
@Component({
    selector: 'app-my-plan',
    templateUrl: './my-plan.component.html',
    styleUrl: './my-plan.component.css'
})
export class MyPlanComponent {
    constructor(private router: Router) { }

    pickItem(): void {
        this.router.navigate(['/pick-item']);
    }
}
