import { Injectable, signal, computed, inject } from '@angular/core';
import {
    WeeklyPlan, WorkCommitment, PlanStatus,
    ItemCategory, CategoryBudget, MemberPlanSummary
} from '../models';
import { TeamService } from './team.service';
import { BacklogService } from './backlog.service';

/**
 * Core planning service — manages weekly plans and work commitments.
 * Enforces business rules: 30h/member limit, category budgets, freeze logic.
 * All data persisted to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class PlanService {
    private readonly PLAN_KEY = 'weekwise-plan';
    private readonly COMMITMENTS_KEY = 'weekwise-commitments';

    /** Hours of productive work per member per week (8h day * 4 days - 2h meeting). */
    static readonly HOURS_PER_MEMBER = 30;

    private teamService = inject(TeamService);
    private backlogService = inject(BacklogService);

    /** The current weekly plan (or null if no active plan). */
    private _currentPlan = signal<WeeklyPlan | null>(this.loadPlan());

    /** All work commitments for the current plan. */
    private _commitments = signal<WorkCommitment[]>(this.loadCommitments());

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

    // --- Persistence ---

    private loadPlan(): WeeklyPlan | null {
        const data = localStorage.getItem(this.PLAN_KEY);
        return data ? JSON.parse(data) : null;
    }

    private loadCommitments(): WorkCommitment[] {
        const data = localStorage.getItem(this.COMMITMENTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    private savePlan(): void {
        const plan = this._currentPlan();
        if (plan) {
            localStorage.setItem(this.PLAN_KEY, JSON.stringify(plan));
        } else {
            localStorage.removeItem(this.PLAN_KEY);
        }
    }

    private saveCommitments(): void {
        localStorage.setItem(this.COMMITMENTS_KEY, JSON.stringify(this._commitments()));
    }

    private generateId(): string {
        return crypto.randomUUID();
    }

    // --- Plan Lifecycle ---

    /** Create a new weekly plan (Lead action). */
    createPlan(): WeeklyPlan {
        const today = new Date();
        const plan: WeeklyPlan = {
            id: this.generateId(),
            weekStartDate: today.toISOString().split('T')[0],
            workPeriodStart: this.getNextDay(today, 3).toISOString().split('T')[0], // Wednesday
            workPeriodEnd: this.getNextDay(today, 8).toISOString().split('T')[0],   // Monday
            status: 'Setup',
            clientPercent: 0,
            techDebtPercent: 0,
            rndPercent: 0,
            selectedMemberIds: [],
            totalHours: 0
        };
        this._currentPlan.set(plan);
        this._commitments.set([]);
        this.savePlan();
        this.saveCommitments();
        return plan;
    }

    /** Set up the plan with member selection and category percentages (Lead action). */
    setupPlan(selectedMemberIds: string[], clientPercent: number, techDebtPercent: number, rndPercent: number): void {
        const plan = this._currentPlan();
        if (!plan || plan.status !== 'Setup') return;

        const totalHours = selectedMemberIds.length * PlanService.HOURS_PER_MEMBER;

        this._currentPlan.set({
            ...plan,
            selectedMemberIds,
            clientPercent,
            techDebtPercent,
            rndPercent,
            totalHours,
            status: 'Planning'
        });
        this.savePlan();
    }

    /** Freeze the plan — no more changes to commitments (Lead action). */
    freezePlan(): boolean {
        const plan = this._currentPlan();
        if (!plan || plan.status !== 'Planning') return false;

        this._currentPlan.set({ ...plan, status: 'Frozen' });
        this.savePlan();
        return true;
    }

    /** Complete the current week (Lead action). */
    completePlan(): void {
        const plan = this._currentPlan();
        if (!plan || plan.status !== 'Frozen') return;

        this._currentPlan.set({ ...plan, status: 'Completed' });
        this.savePlan();
    }

    /** Cancel the current plan and clear all data (Lead action). */
    cancelPlan(): void {
        this._currentPlan.set(null);
        this._commitments.set([]);
        this.savePlan();
        this.saveCommitments();
    }

    // --- Commitments ---

    /** Add a work commitment for a member (during Planning phase). */
    addCommitment(memberId: string, backlogItemId: string, committedHours: number): WorkCommitment | null {
        if (!this.isPlanning()) return null;

        // Validate member hours don't exceed 30
        const memberTotal = this.getMemberCommittedHours(memberId);
        if (memberTotal + committedHours > PlanService.HOURS_PER_MEMBER) return null;

        // Validate category budget
        const item = this.backlogService.getItemById(backlogItemId);
        if (!item) return null;

        const categoryBudget = this.getCategoryBudget(item.category);
        if (categoryBudget.claimedHours + committedHours > categoryBudget.budgetHours) return null;

        const commitment: WorkCommitment = {
            id: this.generateId(),
            weeklyPlanId: this._currentPlan()!.id,
            memberId,
            backlogItemId,
            committedHours
        };

        this._commitments.update(c => [...c, commitment]);
        this.saveCommitments();
        return commitment;
    }

    /** Remove a commitment (during Planning phase only). */
    removeCommitment(commitmentId: string): void {
        if (!this.isPlanning()) return;
        this._commitments.update(c => c.filter(x => x.id !== commitmentId));
        this.saveCommitments();
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

    /** Get the budget breakdown for a specific category. */
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

    /** All three category budgets. */
    getAllCategoryBudgets(): CategoryBudget[] {
        return (['Client', 'TechDebt', 'RnD'] as ItemCategory[]).map(c => this.getCategoryBudget(c));
    }

    /** Get total claimed hours for a category across all members. */
    getCategoryClaimedHours(category: ItemCategory): number {
        return this._commitments()
            .filter(c => {
                const item = this.backlogService.getItemById(c.backlogItemId);
                return item?.category === category;
            })
            .reduce((sum, c) => sum + c.committedHours, 0);
    }

    /** Get remaining category budget hours. */
    getCategoryRemainingHours(category: ItemCategory): number {
        const budget = this.getCategoryBudget(category);
        return budget.budgetHours - budget.claimedHours;
    }

    // --- Member Plan Summaries ---

    /** Get planning summary for all selected members. */
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

    /** Check if ALL selected members are fully planned (can freeze). */
    canFreeze(): boolean {
        const summaries = this.getMemberPlanSummaries();
        return summaries.length > 0 && summaries.every(s => s.isFullyPlanned);
    }

    /** Get validation issues preventing freeze. */
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

    // --- Data Management ---

    /** Replace all plan data (used by data import). */
    setAll(plan: WeeklyPlan | null, commitments: WorkCommitment[]): void {
        this._currentPlan.set(plan);
        this._commitments.set(commitments);
        this.savePlan();
        this.saveCommitments();
    }

    /** Get the current plan snapshot for archiving. */
    getSnapshot(): { plan: WeeklyPlan | null; commitments: WorkCommitment[] } {
        return {
            plan: this._currentPlan(),
            commitments: [...this._commitments()]
        };
    }

    // --- Helpers ---

    private getNextDay(from: Date, daysToAdd: number): Date {
        const result = new Date(from);
        result.setDate(result.getDate() + daysToAdd);
        return result;
    }
}
