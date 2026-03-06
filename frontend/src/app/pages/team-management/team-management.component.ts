import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TeamService } from '../../services/team.service';

@Component({
    selector: 'app-team-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './team-management.component.html',
    styleUrls: ['./team-management.component.css']
})
export class TeamManagementComponent implements OnInit {
    private authService = inject(AuthService);
    private teamService = inject(TeamService);

    members: any[] = [];
    invitations: any[] = [];

    inviteEmail = '';
    inviteRole = 'Member';

    isLoading = true;
    isInviting = false;
    successMessage = '';
    errorMessage = '';
    lastInviteLink = '';

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;

        // Load members
        this.teamService.getMembers().subscribe({
            next: (members) => {
                this.members = members;
            }
        });

        // Load invitations
        this.authService.getInvitations().subscribe({
            next: (invites) => {
                this.invitations = invites;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    onInvite() {
        if (!this.inviteEmail) return;

        this.isInviting = true;
        this.successMessage = '';
        this.errorMessage = '';
        this.lastInviteLink = '';

        this.authService.createInvitation(this.inviteEmail, this.inviteRole).subscribe({
            next: (invite) => {
                this.isInviting = false;
                this.successMessage = `Invitation created for ${this.inviteEmail}!`;
                this.inviteEmail = '';

                // Generate link for manual sharing
                const baseUrl = window.location.origin;
                this.lastInviteLink = `${baseUrl}/accept-invite?token=${invite.token}`;

                this.loadData();
            },
            error: (err) => {
                this.isInviting = false;
                this.errorMessage = err.error || 'Failed to create invitation.';
            }
        });
    }

    copyLink() {
        navigator.clipboard.writeText(this.lastInviteLink);
        this.successMessage = 'Invitation link copied to clipboard!';
    }

    getInitial(name: string): string {
        return name ? name.charAt(0).toUpperCase() : '?';
    }
}
