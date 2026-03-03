import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Pick a backlog item screen (sub-page of My Plan). */
@Component({
    selector: 'app-pick-item',
    templateUrl: './pick-item.component.html',
    styleUrl: './pick-item.component.css'
})
export class PickItemComponent {
    constructor(private router: Router) { }

    goBack(): void {
        this.router.navigate(['/my-plan']);
    }

    addToPlan(): void {
        this.router.navigate(['/my-plan']);
    }
}
