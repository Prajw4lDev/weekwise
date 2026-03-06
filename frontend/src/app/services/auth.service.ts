import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TeamService } from './team.service';

export interface AuthResponse {
    token: string;
    name: string;
    email: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private teamService = inject(TeamService);

    constructor() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    register(data: any): Observable<AuthResponse> {
        return this.mockAuth(data.email || 'user@demo.com', data.name || 'Demo User', data.role || 'Member');
    }

    login(data: any): Observable<AuthResponse> {
        const email = data.email || 'prajwal@demo.com';
        const members = this.teamService.members();
        // Since seed data may not be fully loaded synchronously on cold start before login is called, safe fallback
        let name = 'Demo User';
        let role = 'Admin';

        if (members && members.length > 0) {
            const member = members.find(m => m.email === email);
            if (member) {
                name = member.name;
                role = member.role;
            }
        }

        return this.mockAuth(email, name, role);
    }

    private mockAuth(email: string, name: string, role: string): Observable<AuthResponse> {
        const user: AuthResponse = {
            token: 'mock-jwt-token-for-local-storage-demo',
            name,
            email,
            role
        };

        localStorage.setItem('token', user.token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);

        return of(user);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    validateInviteToken(token: string): Observable<boolean> {
        return of(true);
    }

    getInvitation(token: string): Observable<any> {
        return of({ email: 'newuser@demo.com', role: 'Member', isUsed: false });
    }

    registerWithInvite(data: any): Observable<AuthResponse> {
        return this.mockAuth(data.email, data.name || 'Invited User', 'Member');
    }

    createInvitation(email: string, role: string): Observable<any> {
        return of({ id: Date.now(), email, role, token: 'mock-token', createdAt: new Date(), isUsed: false });
    }

    getInvitations(): Observable<any[]> {
        return of([]);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getRole(): string | null {
        return localStorage.getItem('role');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
