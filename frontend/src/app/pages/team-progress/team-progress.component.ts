import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Team progress dashboard — overview of all members and categories. */
@Component({
    selector: 'app-team-progress',
    templateUrl: './team-progress.component.html',
    styleUrl: './team-progress.component.css'
})
export class TeamProgressComponent {
    constructor(private router: Router) { }

    viewDetail(): void {
        this.router.navigate(['/task-detail']);
    }
}
