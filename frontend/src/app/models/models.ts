import { MemberRole, ItemCategory, PlanStatus, TaskStatus } from './enums';

/**
 * Weekwise — Core domain models.
 */

/** A member of the team. */
export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    isActive: boolean;
    weeklyCapacityHours: number;
}

/** A backlog work item that can be picked up during planning. */
export interface BacklogItem {
    id: string;
    title: string;
    description: string;
    category: ItemCategory;
    estimatedHours: number;
    isArchived: boolean;
}

/**
 * A weekly planning cycle.
 * Created by the Lead on Tuesdays for the Wed–Mon work period.
 */
export interface WeeklyPlan {
    id: string;
    weekStartDate: string;        // ISO date string (the Tuesday)
    workPeriodStart: string;       // Wednesday
    workPeriodEnd: string;         // Monday
    status: PlanStatus;
    clientPercent: number;
    techDebtPercent: number;
    rndPercent: number;
    selectedMemberIds: string[];
    totalHours: number;            // selectedMembers.length * 30
}

/**
 * A single member's commitment to work on a backlog item.
 * Created during the planning phase (before freeze).
 */
export interface WorkCommitment {
    id: string;
    weeklyPlanId: string;
    memberId: string;
    backlogItemId: string;
    committedHours: number;
}

/**
 * A progress update on a work commitment.
 * Created after the plan is frozen, during the execution phase.
 */
export interface ProgressUpdate {
    id: string;
    workCommitmentId: string;
    hoursCompleted: number;
    status: TaskStatus;
    notes: string;
    updatedAt: string;             // ISO datetime string
}

/**
 * Snapshot of a completed week for historical viewing.
 * Stored when the Lead finishes a weekly cycle.
 */
export interface PastWeekRecord {
    weeklyPlan: WeeklyPlan;
    commitments: WorkCommitment[];
    progressUpdates: ProgressUpdate[];
    backlogSnapshot: BacklogItem[];
    members: TeamMember[];
    completedAt: string;           // ISO datetime string
}

/**
 * Category budget breakdown — computed from WeeklyPlan percentages.
 * Used in the UI to display budget vs. claimed hours per category.
 */
export interface CategoryBudget {
    category: ItemCategory;
    budgetPercent: number;
    budgetHours: number;
    claimedHours: number;
}

/**
 * Member planning summary — used in Review & Freeze screen.
 */
export interface MemberPlanSummary {
    member: TeamMember;
    committedHours: number;
    maxHours: number;              // Always 30
    isFullyPlanned: boolean;
}

/**
 * Member progress summary — used in Team Progress dashboard.
 */
export interface MemberProgressSummary {
    member: TeamMember;
    totalCommitted: number;
    totalDone: number;
    progressPercent: number;
    tasksDone: number;
    totalTasks: number;
    blockedTasks: number;
}

/**
 * Dashboard Statistics DTOs
 */
export interface DashboardOverview {
    overallProgressPercentage: number;
    totalTasksCount: number;
    completedTasksCount: number;
    blockedTasksCount: number;
    totalMembersCount: number;
    totalBacklogTasksCount: number;
    totalPlannedHours: number;
}

export interface DashboardCategory {
    category: ItemCategory;
    budgetHours: number;
    committedHours: number;
    completedHours: number;
    progressPercentage: number;
}

export interface DashboardMember {
    memberId: string;
    name: string;
    totalCommittedHours: number;
    totalCompletedHours: number;
    progressPercentage: number;
}

export interface DashboardTrend {
    label: string;
    completedHours: number;
}
