import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { TeamService } from '../../services/team.service';
import { BacklogService } from '../../services/backlog.service';
import { CategoryBudget, MemberPlanSummary } from '../../models/models';
import { ItemCategory } from '../../models/enums';

@Component({
  selector: 'app-review-freeze',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-freeze.component.html',
  styleUrl: './review-freeze.component.css'
})
export class ReviewFreezeComponent {

  private router = inject(Router);
  private planService = inject(PlanService);
  private teamService = inject(TeamService);
  private backlogService = inject(BacklogService);

  protected readonly Math = Math;

  get categoryBudgets(): CategoryBudget[] {
    return this.planService.getAllCategoryBudgets();
  }

  get memberSummaries(): MemberPlanSummary[] {
    return this.planService.getMemberPlanSummaries();
  }

  get canFreeze(): boolean {
    return this.planService.canFreeze();
  }

  get freezeIssues(): string[] {
    return this.planService.getFreezeValidationIssues();
  }

  async freezePlan(): Promise<void> {
    if (!this.planService.canFreeze()) return;

    const success = await this.planService.freezePlan();
    if (success) {
      this.router.navigate(['/home-admin']);
    } else {
      alert('Failed to freeze plan. Please check the console for details.');
    }
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return 'var(--status-done)';
    if (percent >= 50) return 'var(--status-inprogress)';
    return 'var(--status-notstarted)';
  }

  getProgressVibrantColor(percent: number): string {
    if (percent >= 90) return '#10b981';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  }

  getCategoryLabel(cat: ItemCategory): string {
    switch (cat) {
      case 'Client': return '🟢 Client';
      case 'TechDebt': return '🟡 Tech Debt';
      case 'RnD': return '🔵 R&D';
      default: return cat;
    }
  }

  getCategoryClass(cat: ItemCategory): string {
    switch (cat) {
      case 'Client': return 'badge-client';
      case 'TechDebt': return 'badge-techdebt';
      case 'RnD': return 'badge-rnd';
      default: return '';
    }
  }

  getGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
    ];
    return gradients[index % gradients.length];
  }

}
