import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService, BacklogService, TeamService } from '../../services';
import { CategoryBudget, MemberPlanSummary, ItemCategory } from '../../models';

@Component({
selector: 'app-review-freeze',
standalone: true,
imports: [CommonModule],
templateUrl: './review-freeze.component.html',
styleUrl: './review-freeze.component.css'
})
export class ReviewFreezeComponent {

private router = inject(Router);

planService = inject(PlanService);
backlogService = inject(BacklogService);
teamService = inject(TeamService);

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

freezePlan(): void {
if (this.planService.freezePlan()) {
this.router.navigate(['/home']);
}
}

getProgressPercent(budget: CategoryBudget): number {
return budget.budgetHours > 0
? Math.round((budget.claimedHours / budget.budgetHours) * 100)
: 0;
}

getProgressColor(percent: number): string {
if (percent >= 90) return 'green';
if (percent >= 50) return 'amber';
return '';
}

getCategoryLabel(cat: ItemCategory): string {
switch (cat) {
case 'Client': return '🟢 Client';
case 'TechDebt': return '🟡 Tech Debt';
case 'RnD': return '🔵 R&D';
}
}

getCategoryClass(cat: ItemCategory): string {
switch (cat) {
case 'Client': return 'badge-client';
case 'TechDebt': return 'badge-techdebt';
case 'RnD': return 'badge-rnd';
}
}

getGradient(index: number): string {
const gradients = [
'linear-gradient(135deg,#6366f1,#8b5cf6)',
'linear-gradient(135deg,#3b82f6,#06b6d4)',
'linear-gradient(135deg,#f59e0b,#ef4444)',
'linear-gradient(135deg,#10b981,#059669)',
'linear-gradient(135deg,#ec4899,#f43f5e)'
];
return gradients[index % gradients.length];
}
}
