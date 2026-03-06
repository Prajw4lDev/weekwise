import { Component, inject, signal, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardOverview, DashboardCategory, DashboardMember, DashboardTrend } from '../../models/models';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-dashboard-analytics',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './dashboard-analytics.component.html',
    styleUrl: './dashboard-analytics.component.css'
})
export class DashboardAnalyticsComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    private cdr = inject(ChangeDetectorRef);

    overview = signal<DashboardOverview | null>(null);
    categories = signal<DashboardCategory[]>([]);
    members = signal<DashboardMember[]>([]);
    trends = signal<DashboardTrend[]>([]);
    isLoading = signal(true);

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    // Line Chart: Weekly Progress
    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } }
        },
        plugins: {
            legend: { display: false },
        }
    };
    public lineChartType: ChartType = 'line';
    public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };

    ngOnInit() {
        this.refreshData();
    }

    refreshData() {
        this.isLoading.set(true);

        this.dashboardService.getOverview().subscribe({
            next: data => {
                this.overview.set(data);
                this.cdr.detectChanges();
            },
            error: () => this.isLoading.set(false)
        });

        this.dashboardService.getCategories().subscribe({
            next: cats => {
                this.categories.set(cats);
                this.cdr.detectChanges();
            }
        });

        this.dashboardService.getMembers().subscribe({
            next: mems => {
                this.members.set(mems);
                this.cdr.detectChanges();
            }
        });

        this.dashboardService.getTrend().subscribe({
            next: trend => {
                this.trends.set(trend);
                this.updateLineChart(trend);
                this.isLoading.set(false);
                this.cdr.detectChanges();
            },
            error: () => this.isLoading.set(false)
        });
    }

    private updateLineChart(trend: DashboardTrend[]) {
        this.lineChartData = {
            labels: trend.map(t => t.label),
            datasets: [{
                data: trend.map(t => t.completedHours),
                label: 'Completed Hours',
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#a855f7'
            }]
        };
    }
}
