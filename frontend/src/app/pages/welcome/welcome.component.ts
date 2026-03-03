import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services';

/**
 * Welcome/Team Setup screen.
 * Allows adding team members and assigning a lead.
 * Wired to TeamService for real persistence.
 */
@Component({
    selector: 'app-welcome',
    imports: [FormsModule],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
    private router = inject(Router);
    teamService = inject(TeamService);

    /** New member name input. */
    newMemberName = '';

    /** Add a member and clear the input. */
    addMember(): void {
        const name = this.newMemberName.trim();
        if (!name) return;

        // First member becomes Lead automatically
        const role = this.teamService.members().length === 0 ? 'Lead' as const : 'Member' as const;
        this.teamService.addMember(name, role);
        this.newMemberName = '';
    }

    /** Handle Enter key in the input. */
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.addMember();
        }
    }

    /** Set a member as the team lead. */
    makeLead(memberId: string): void {
        this.teamService.setLead(memberId);
    }

    /** Remove a member from the team. */
    removeMember(memberId: string): void {
        this.teamService.removeMember(memberId);
    }

    /** Navigate to login if we have at least one lead. */
    continue(): void {
        if (this.teamService.leads().length === 0) return;
        this.router.navigate(['/login']);
    }

    /** Get initials/first char for avatar. */
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

    /** Can we proceed? Need at least 1 lead. */
    get canContinue(): boolean {
        return this.teamService.leads().length > 0 && this.teamService.members().length >= 2;
    }
}
