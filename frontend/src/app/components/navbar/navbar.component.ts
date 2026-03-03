import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserContextService, ThemeService } from '../../services';

/**
 * Shared navbar component displayed on every page.
 * Shows the app logo, current user info, theme toggle, and home button.
 */
@Component({
    selector: 'app-navbar',
    imports: [RouterLink],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    private router = inject(Router);
    userContext = inject(UserContextService);
    themeService = inject(ThemeService);

    /** Navigate to the appropriate home dashboard based on role. */
    goHome(): void {
        if (this.userContext.isLead()) {
            this.router.navigate(['/home']);
        } else if (this.userContext.isLoggedIn()) {
            this.router.navigate(['/home-member']);
        } else {
            this.router.navigate(['/welcome']);
        }
    }

    /** Navigate to the login/user-select screen. */
    switchUser(): void {
        this.router.navigate(['/login']);
    }

    /** Toggle dark/light theme. */
    toggleTheme(): void {
        this.themeService.toggle();
    }

    /** Get initial for avatar. */
    getInitial(): string {
        const user = this.userContext.currentUser();
        return user ? user.name.charAt(0).toUpperCase() : '?';
    }
}
