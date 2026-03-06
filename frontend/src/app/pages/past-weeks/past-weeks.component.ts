import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService, DataService } from '../../services';
import { PastWeekRecord } from '../../models';

/** Past weeks — view completed planning cycles and import/export data. */
@Component({
    selector: 'app-past-weeks',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './past-weeks.component.html',
    styleUrl: './past-weeks.component.css'
})
export class PastWeeksComponent implements OnInit {
    planService = inject(PlanService);
    dataService = inject(DataService);

    pastWeeks = signal<PastWeekRecord[]>([]);

    async ngOnInit(): Promise<void> {
        const history = await this.planService.getHistory();
        this.pastWeeks.set(history);
    }

    exportData(): void {
        this.dataService.downloadExport();
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            const json = e.target.result;
            if (this.dataService.importData(json)) {
                alert('Data imported successfully! Reloading...');
                window.location.reload();
            } else {
                alert('Invalid data format.');
            }
        };
        reader.readAsText(file);
    }
}
