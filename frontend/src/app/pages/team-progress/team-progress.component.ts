import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PlanService } from '../../services';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';

interface DashboardOverview {
    overallProgressPercentage: number;
    totalTasksCount: number;
    completedTasksCount: number;
    blockedTasksCount: number;
    totalHours?: number; // Optional on frontend
}

interface DashboardCategory {
    category: string;
    budgetHours: number;
    committedHours: number;
    completedHours: number;
    progressPercentage: number;
}

interface DashboardMember {
    memberId: string;
    name: string;
    totalCommittedHours: number;
    totalCompletedHours: number;
    progressPercentage: number;
}

/** Team progress dashboard — overview of all members and categories. */
@Component({
    selector: 'app-team-progress',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './team-progress.component.html',
    styleUrl: './team-progress.component.css'
})
export class TeamProgressComponent implements OnInit {
    private router = inject(Router);
    private http = inject(HttpClient);
    planService = inject(PlanService);
    protected readonly Math = Math;

    private apiUrl = `${environment.apiUrl}/dashboard`;

    overview: DashboardOverview = {
        overallProgressPercentage: 0,
        totalTasksCount: 0,
        completedTasksCount: 0,
        blockedTasksCount: 0
    };

    categories: DashboardCategory[] = [];
    members: DashboardMember[] = [];
    loading = true;
    error = '';

    async ngOnInit(): Promise<void> {
        if (!this.planService.isFrozen() && !this.planService.isPlanning()) {
            this.loading = false;
            this.error = 'No active plan. Create and set up a plan first.';
            return;
        }
        await this.loadData();
    }

    async loadData(): Promise<void> {
        this.loading = true;
        this.error = '';
        try {
            const [overview, categories, members] = await Promise.all([
                lastValueFrom(this.http.get<DashboardOverview>(`${this.apiUrl}/overview`)),
                lastValueFrom(this.http.get<DashboardCategory[]>(`${this.apiUrl}/categories`)),
                lastValueFrom(this.http.get<DashboardMember[]>(`${this.apiUrl}/members`))
            ]);
            this.overview = overview;
            this.categories = categories;
            this.members = members;
            this.overview.totalHours = this.totalHours;
        } catch (e: any) {
            this.error = e.error?.error || 'Failed to load dashboard data.';
        } finally {
            this.loading = false;
        }
    }

    getCategoryLabel(cat: string): string {
        if (cat === 'Client') return '🟢 Client';
        if (cat === 'TechDebt') return '🟡 Tech Debt';
        return '🔵 R&D';
    }

    getCategoryClass(cat: string): string {
        if (cat === 'Client') return 'badge-client';
        if (cat === 'TechDebt') return 'badge-techdebt';
        return 'badge-rnd';
    }

    getCategoryBorderColor(cat: string): string {
        if (cat === 'Client') return 'var(--cat-client, #10b981)';
        if (cat === 'TechDebt') return 'var(--cat-techdebt, #f59e0b)';
        return 'var(--cat-rnd, #6366f1)';
    }

    getCategoryColor(cat: string): string {
        return this.getCategoryBorderColor(cat);
    }

    get totalHours(): number {
        return this.categories.reduce((sum, c) => sum + c.budgetHours, 0);
    }

    getProgressBarClass(percent: number): string {
        if (percent >= 80) return 'green';
        if (percent >= 50) return 'amber';
        return '';
    }

    getAvatarGradient(index: number): string {
        const gradients = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #3b82f6, #06b6d4)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #ec4899, #db2777)',
        ];
        return gradients[index % gradients.length];
    }

    goBack(): void {
        this.router.navigate(['/home-admin']);
    }
}
