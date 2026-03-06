import { Routes } from '@angular/router';

import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { HomeMemberComponent } from './pages/home-member/home-member.component';
import { BacklogComponent } from './pages/backlog/backlog.component';
import { PlanSetupComponent } from './pages/plan-setup/plan-setup.component';
import { MyPlanComponent } from './pages/my-plan/my-plan.component';
import { PickItemComponent } from './pages/pick-item/pick-item.component';
import { ReviewFreezeComponent } from './pages/review-freeze/review-freeze.component';
import { UpdateProgressComponent } from './pages/update-progress/update-progress.component';
import { TeamProgressComponent } from './pages/team-progress/team-progress.component';
import { TaskDetailComponent } from './pages/task-detail/task-detail.component';
import { PastWeeksComponent } from './pages/past-weeks/past-weeks.component';
import { RegisterComponent } from './pages/register/register.component';
import { AcceptInviteComponent } from './pages/accept-invite/accept-invite.component';
import { TeamManagementComponent } from './pages/team-management/team-management.component';
import { RoleGuard } from './guards/role.guard';

/**
 * Application routes.
 * Default route → welcome (team setup).
 * Lead-only routes: /home, /plan-setup, /review
 * Member routes: /home-member, /my-plan, /pick-item, /update-progress
 * Shared routes: /backlog, /progress, /task-detail, /past-weeks
 */
export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'accept-invite', component: AcceptInviteComponent },
    { path: 'home-admin', component: HomeComponent, canActivate: [RoleGuard], data: { role: 'Admin' } },
    { path: 'team-management', component: TeamManagementComponent, canActivate: [RoleGuard], data: { role: 'Admin' } },
    { path: 'home-member', component: HomeMemberComponent, canActivate: [RoleGuard], data: { role: 'Member' } },
    { path: 'backlog', component: BacklogComponent, canActivate: [RoleGuard] },
    { path: 'plan-setup', component: PlanSetupComponent, canActivate: [RoleGuard], data: { role: 'Admin' } },
    { path: 'my-plan', component: MyPlanComponent, canActivate: [RoleGuard], data: { role: 'Member' } },
    { path: 'pick-item', component: PickItemComponent, canActivate: [RoleGuard], data: { role: 'Member' } },
    { path: 'review-plan', component: ReviewFreezeComponent, canActivate: [RoleGuard], data: { role: 'Admin' } },
    { path: 'update-progress', component: UpdateProgressComponent, canActivate: [RoleGuard], data: { role: 'Member' } },
    { path: 'team-progress', component: TeamProgressComponent, canActivate: [RoleGuard] },
    { path: 'task-detail', component: TaskDetailComponent, canActivate: [RoleGuard] },
    { path: 'past-weeks', component: PastWeeksComponent, canActivate: [RoleGuard] },
    { path: '**', redirectTo: 'login' },
];
