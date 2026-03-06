import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserContextService } from '../../services';

/**
 * Login screen — "Who are you?"
 * Displays team member cards; clicking one sets the current user and navigates to home.
 */
@Component({
    selector: 'app-login',
    imports: [RouterLink, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private router = inject(Router);
    authService = inject(AuthService);
    userContext = inject(UserContextService);

    /** Login credentials. */
    email = '';
    password = '';
    error = '';
    isLoading = false;

    /** Verify credentials and log in. */
    async verifyLogin(): Promise<void> {
        const trimmedEmail = this.email.trim();
        const trimmedPassword = this.password.trim();
        if (!trimmedEmail || !trimmedPassword) return;

        this.isLoading = true;
        this.error = '';

        this.authService.login({ email: trimmedEmail, password: trimmedPassword }).subscribe({
            next: (user) => {
                if (user.role === 'Admin') {
                    this.router.navigate(['/home-admin']);
                } else {
                    this.router.navigate(['/home-member']);
                }
            },
            error: (err) => {
                if (typeof err.error === 'string') {
                    this.error = err.error;
                } else if (err.error?.message) {
                    this.error = err.error.message;
                } else {
                    this.error = err.statusText || 'Login failed. Please check your credentials.';
                }
                this.isLoading = false;
            }
        });
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
