import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const expectedRole = route.data['role'];
        const currentRole = this.authService.getRole();

        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }

        if (expectedRole && currentRole !== expectedRole) {
            // Redirect to appropriate dashboard based on actual role
            if (currentRole === 'Admin') {
                this.router.navigate(['/home-admin']);
            } else {
                this.router.navigate(['/home-member']);
            }
            return false;
        }

        return true;
    }
}
