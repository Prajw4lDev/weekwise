import { Injectable, signal, computed, inject } from '@angular/core';
import {
    WeeklyPlan, WorkCommitment, PlanStatus,
    ItemCategory, CategoryBudget, MemberPlanSummary, PastWeekRecord
} from '../models';
import { TeamService } from './team.service';
import { BacklogService } from './backlog.service';

/**
 * Core planning service — manages weekly plans and work commitments.
 * Enforces business rules: 30h/member limit, category budgets, freeze logic.
 * Uses localStorage instead of .NET Backend.
 */
@Injectable({ providedIn: 'root' })
export class PlanService {
    /** Hours of productive work per member per week. */
    static readonly HOURS_PER_MEMBER = 30;

    private readonly PLAN_KEY = 'weekwise-current-plan';
    private readonly COMMITMENTS_KEY = 'weekwise-commitments';

    private teamService = inject(TeamService);
    private backlogService = inject(BacklogService);

    /** The current weekly plan (or null if no active plan). */
    private _currentPlan = signal<WeeklyPlan | null>(null);

    /** Bulk set plan and commitments (used by DataService). */
    setAll(plan: WeeklyPlan | null, commitments: WorkCommitment[]): void {
        this._currentPlan.set(plan);
        this._commitments.set(commitments);
        this.saveCurrentPlan(plan);
        this.saveCommitments(commitments);
    }

    /** All work commitments for the current plan. */
    private _commitments = signal<WorkCommitment[]>([]);

    readonly currentPlan = this._currentPlan.asReadonly();
    readonly commitments = this._commitments.asReadonly();

    /** Computed: does an active plan exist? */
    readonly hasActivePlan = computed(() => this._currentPlan() !== null);

    /** Computed: current plan status. */
    readonly planStatus = computed(() => this._currentPlan()?.status ?? null);

    /** Computed: is the plan in a state where members can add commitments? */
    readonly isPlanning = computed(() => this.planStatus() === 'Planning');

    /** Computed: is the plan frozen (execution mode)? */
    readonly isFrozen = computed(() => this.planStatus() === 'Frozen');

    constructor() {
        this.loadCurrentPlan();
    }

    private saveCurrentPlan(plan: WeeklyPlan | null): void {
        if (plan) {
            localStorage.setItem(this.PLAN_KEY, JSON.stringify(plan));
        } else {
            localStorage.removeItem(this.PLAN_KEY);
        }
    }

    private saveCommitments(commitments: WorkCommitment[]): void {
        localStorage.setItem(this.COMMITMENTS_KEY, JSON.stringify(commitments));
    }

    /** Load current plan and its commitments from localStorage. */
    async loadCurrentPlan(): Promise<void> {
        const planData = localStorage.getItem(this.PLAN_KEY);
        const plan = planData ? JSON.parse(planData) : null;
        this._currentPlan.set(plan);

        if (plan) {
            const commitmentsData = localStorage.getItem(this.COMMITMENTS_KEY);
            this._commitments.set(commitmentsData ? JSON.parse(commitmentsData) : []);
        } else {
            this._commitments.set([]);
        }
    }

    // --- Plan Lifecycle ---

    /** Create a new weekly plan (Lead action). */
    async createPlan(): Promise<WeeklyPlan> {
        const nextMonday = new Date(); // Mock logic
        const plan: WeeklyPlan = {
            id: Date.now().toString(),
            weekStartDate: nextMonday.toISOString(),
            workPeriodStart: nextMonday.toISOString(),
            workPeriodEnd: nextMonday.toISOString(),
            status: 'Planning',
            totalHours: 0,
            selectedMemberIds: [],
            clientPercent: 60,
            techDebtPercent: 20,
            rndPercent: 20
        };

        this._currentPlan.set(plan);
        this._commitments.set([]);
        this.saveCurrentPlan(plan);
        this.saveCommitments([]);
        return plan;
    }

    /** Set up the plan with member selection and category percentages (Lead action). */
    async setupPlan(selectedMemberIds: string[], clientPercent: number, techDebtPercent: number, rndPercent: number): Promise<void> {
        const plan = this._currentPlan();
        if (!plan) return;

        const updatedPlan = {
            ...plan,
            selectedMemberIds,
            clientPercent,
            techDebtPercent,
            rndPercent,
            totalHours: selectedMemberIds.length * PlanService.HOURS_PER_MEMBER
        };

        this._currentPlan.set(updatedPlan);
        this.saveCurrentPlan(updatedPlan);
    }

    /** Freeze the plan — no more changes to commitments (Lead action). */
    async freezePlan(): Promise<boolean> {
        const plan = this._currentPlan();
        if (!plan) return false;

        const updatedPlan = { ...plan, status: 'Frozen' as PlanStatus };
        this._currentPlan.set(updatedPlan);
        this.saveCurrentPlan(updatedPlan);
        return true;
    }

    /** Complete the current week (Lead action). */
    async completePlan(): Promise<void> {
        const plan = this._currentPlan();
        if (!plan) return;

        const updatedPlan = { ...plan, status: 'Completed' as PlanStatus };
        this._currentPlan.set(updatedPlan);
        this.saveCurrentPlan(updatedPlan);
    }

    /** Cancel the current plan and clear all data (Lead action). */
    async cancelPlan(): Promise<void> {
        this._currentPlan.set(null);
        this._commitments.set([]);
        this.saveCurrentPlan(null);
        this.saveCommitments([]);
    }

    // --- Commitments ---

    /** Add a work commitment for a member (during Planning phase). */
    async addCommitment(memberId: string, backlogItemId: string, committedHours: number): Promise<WorkCommitment | null> {
        if (!this.isPlanning()) return null;

        const commitment: WorkCommitment = {
            id: Date.now().toString(),
            weeklyPlanId: this._currentPlan()?.id || '',
            memberId,
            backlogItemId,
            committedHours
        };

        this._commitments.update(c => {
            const updated = [...c, commitment];
            this.saveCommitments(updated);
            return updated;
        });
        return commitment;
    }

    /** Remove a commitment (during Planning phase only). */
    async removeCommitment(commitmentId: string): Promise<void> {
        if (!this.isPlanning()) return;
        this._commitments.update(c => {
            const updated = c.filter(x => x.id !== commitmentId);
            this.saveCommitments(updated);
            return updated;
        });
    }

    /** Get history of past weekly plans. */
    async getHistory(): Promise<PastWeekRecord[]> {
        const data = localStorage.getItem('weekwise-past-weeks');
        return data ? JSON.parse(data) : [];
    }

    /** Get all commitments for a specific member. */
    getMemberCommitments(memberId: string): WorkCommitment[] {
        return this._commitments().filter(c => c.memberId === memberId);
    }

    /** Get total hours committed by a member. */
    getMemberCommittedHours(memberId: string): number {
        return this.getMemberCommitments(memberId)
            .reduce((sum, c) => sum + c.committedHours, 0);
    }

    /** Get remaining hours for a member. */
    getMemberRemainingHours(memberId: string): number {
        return PlanService.HOURS_PER_MEMBER - this.getMemberCommittedHours(memberId);
    }

    // --- Category Budgets ---

    getCategoryBudget(category: ItemCategory): CategoryBudget {
        const plan = this._currentPlan();
        if (!plan) {
            return { category, budgetPercent: 0, budgetHours: 0, claimedHours: 0 };
        }

        let budgetPercent = 0;
        if (category === 'Client') budgetPercent = plan.clientPercent;
        else if (category === 'TechDebt') budgetPercent = plan.techDebtPercent;
        else if (category === 'RnD') budgetPercent = plan.rndPercent;

        const budgetHours = Math.round((plan.totalHours * budgetPercent) / 100);
        const claimedHours = this.getCategoryClaimedHours(category);

        return { category, budgetPercent, budgetHours, claimedHours };
    }

    getAllCategoryBudgets(): CategoryBudget[] {
        return (['Client', 'TechDebt', 'RnD'] as ItemCategory[]).map(c => this.getCategoryBudget(c));
    }

    getCategoryClaimedHours(category: ItemCategory): number {
        return this._commitments()
            .filter(c => {
                const item = this.backlogService.getItemById(c.backlogItemId);
                return item?.category === category;
            })
            .reduce((sum, c) => sum + c.committedHours, 0);
    }

    getCategoryRemainingHours(category: ItemCategory): number {
        const budget = this.getCategoryBudget(category);
        return budget.budgetHours - budget.claimedHours;
    }

    // --- Member Plan Summaries ---

    getMemberPlanSummaries(): MemberPlanSummary[] {
        const plan = this._currentPlan();
        if (!plan) return [];

        return plan.selectedMemberIds.map(id => {
            const member = this.teamService.getMemberById(id);
            if (!member) return null;

            const committedHours = this.getMemberCommittedHours(id);
            return {
                member,
                committedHours,
                maxHours: PlanService.HOURS_PER_MEMBER,
                isFullyPlanned: committedHours === PlanService.HOURS_PER_MEMBER
            };
        }).filter((s): s is MemberPlanSummary => s !== null);
    }

    canFreeze(): boolean {
        const summaries = this.getMemberPlanSummaries();
        return summaries.length > 0 && summaries.every(s => s.isFullyPlanned);
    }

    getFreezeValidationIssues(): string[] {
        const issues: string[] = [];
        const summaries = this.getMemberPlanSummaries();
        for (const s of summaries) {
            if (!s.isFullyPlanned) {
                const remaining = s.maxHours - s.committedHours;
                issues.push(`${s.member.name} has only committed ${s.committedHours} of ${s.maxHours} hours (${remaining}h remaining).`);
            }
        }
        return issues;
    }
}
