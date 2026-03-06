/**
 * Weekwise — Enum type aliases.
 * Used across models, services, and components.
 */

/** Role of a team member. */
export type MemberRole = 'Admin' | 'Member';

/** Backlog item category — maps to team budget allocation. */
export type ItemCategory = 'Client' | 'TechDebt' | 'RnD';

/** Lifecycle status of a weekly plan. */
export type PlanStatus = 'Setup' | 'Planning' | 'Frozen' | 'Completed' | 'Cancelled';

/** Status of an individual task commitment. */
export type TaskStatus = 'NotStarted' | 'InProgress' | 'Done' | 'Blocked';
