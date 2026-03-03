import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TeamService, UserContextService } from '../../services';
import { TeamMember } from '../../models';

/**
 * Login screen — "Who are you?"
 * Displays team member cards; clicking one sets the current user and navigates to home.
 */
@Component({
    selector: 'app-login',
    imports: [RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private router = inject(Router);
    teamService = inject(TeamService);
    private userContext = inject(UserContextService);

    /** Select a user and navigate to the appropriate dashboard. */
    selectUser(member: TeamMember): void {
        this.userContext.setUser(member);
        if (member.role === 'Lead') {
            this.router.navigate(['/home']);
        } else {
            this.router.navigate(['/home-member']);
        }
    }

    /** Get initials for avatar. */
    getInitial(name: string): string {
        return name.charAt(0).toUpperCase();
    }

    /** Get a gradient for a member based on index. */
    getGradient(index: number): string {
        const gradients = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #3b82f6, #06b6d4)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #ec4899, #f43f5e)',
            'linear-gradient(135deg, #8b5cf6, #d946ef)',
        ];
        return gradients[index % gradients.length];
    }
}
