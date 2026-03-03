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

/**
 * Application routes.
 * Default route → welcome (team setup).
 * Lead-only routes: /home, /plan-setup, /review
 * Member routes: /home-member, /my-plan, /pick-item, /update-progress
 * Shared routes: /backlog, /progress, /task-detail, /past-weeks
 */
export const routes: Routes = [
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'home-member', component: HomeMemberComponent },
    { path: 'backlog', component: BacklogComponent },
    { path: 'plan-setup', component: PlanSetupComponent },
    { path: 'my-plan', component: MyPlanComponent },
    { path: 'pick-item', component: PickItemComponent },
    { path: 'review', component: ReviewFreezeComponent },
    { path: 'update-progress', component: UpdateProgressComponent },
    { path: 'progress', component: TeamProgressComponent },
    { path: 'task-detail', component: TaskDetailComponent },
    { path: 'past-weeks', component: PastWeeksComponent },
    { path: '**', redirectTo: 'welcome' },
];
