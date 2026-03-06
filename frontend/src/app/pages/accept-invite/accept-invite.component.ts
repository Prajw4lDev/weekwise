import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-accept-invite',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './accept-invite.component.html',
    styleUrls: ['./accept-invite.component.css']
})
export class AcceptInviteComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);

    token: string = '';
    invitation: any = null;
    isValid = false;
    isLoading = true;
    isSubmitting = false;
    error = '';

    registerData = {
        name: '',
        password: ''
    };

    ngOnInit() {
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
        if (!this.token) {
            this.error = 'Invalid or missing invitation token.';
            this.isLoading = false;
            return;
        }

        this.validateToken();
    }

    validateToken() {
        this.authService.getInvitation(this.token).subscribe({
            next: (invite) => {
                if (invite.status !== 'Pending') {
                    this.error = 'This invitation has already been used or expired.';
                    this.isValid = false;
                } else {
                    this.invitation = invite;
                    this.isValid = true;
                }
                this.isLoading = false;
            },
            error: () => {
                this.error = 'Invalid invitation token.';
                this.isLoading = false;
                this.isValid = false;
            }
        });
    }

    onSubmit() {
        this.isSubmitting = true;
        this.error = '';

        const data = {
            token: this.token,
            name: this.registerData.name,
            password: this.registerData.password
        };

        this.authService.registerWithInvite(data).subscribe({
            next: (user) => {
                if (user.role === 'Admin') {
                    this.router.navigate(['/home-admin']);
                } else {
                    this.router.navigate(['/home-member']);
                }
            },
            error: (err) => {
                this.error = err.error || 'Registration failed. Please try again.';
                this.isSubmitting = false;
            }
        });
    }
}
