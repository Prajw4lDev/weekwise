import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Task detail view — shows a backlog item's full info, assignees, and update history. */
@Component({
    selector: 'app-task-detail',
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
    constructor(private router: Router) { }

    goBack(): void {
        this.router.navigate(['/progress']);
    }
}
