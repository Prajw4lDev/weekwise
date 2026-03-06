import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ThemeService } from '../../services';

/**
 * Shared navbar component displayed on every page.
 * Shows the app logo, current user info, theme toggle, and home button.
 */
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    private router = inject(Router);
    authService = inject(AuthService);
    themeService = inject(ThemeService);

    /** Navigate to the appropriate home dashboard based on role. */
    goHome(): void {
        const role = this.authService.getRole();
        if (role === 'Admin') {
            this.router.navigate(['/home-admin']);
        } else if (this.authService.isLoggedIn()) {
            this.router.navigate(['/home-member']);
        } else {
            this.router.navigate(['/welcome']);
        }
    }

    /** Navigate to the login/user-select screen. */
    switchUser(): void {
        this.router.navigate(['/login']);
    }

    /** Log out and clear session. */
    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    /** Toggle dark/light theme. */
    toggleTheme(): void {
        this.themeService.toggle();
    }

    /** Get logged-in user's display name. */
    getUserName(): string {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                return user.name || user.email?.split('@')[0] || 'User';
            } catch { return 'User'; }
        }
        return 'User';
    }
}
