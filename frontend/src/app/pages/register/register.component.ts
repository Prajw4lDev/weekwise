import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    registerData = {
        name: '',
        email: '',
        password: '',
        role: 'Member'
    };
    isLoading = false;
    error = '';

    constructor(private authService: AuthService, private router: Router) { }

    onRegister() {
        this.isLoading = true;
        this.error = '';

        this.authService.register(this.registerData).subscribe({
            next: (response) => {
                const user = response;
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
                } else if (err.error?.title) {
                    this.error = err.error.title;
                } else {
                    this.error = err.statusText || 'Registration failed. Please try again.';
                }
                this.isLoading = false;
            }
        });
    }
}
