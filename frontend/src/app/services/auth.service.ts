import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Auth`;
    private invitationUrl = `${environment.apiUrl}/Invitation`;

    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                this.currentUserSubject.next(JSON.parse(savedUser));
            } catch {
                this.logout();
            }
        }
    }

    register(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap(user => this.setSession(user))
        );
    }

    login(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
            tap(user => this.setSession(user))
        );
    }

    private setSession(user: AuthResponse): void {
        localStorage.setItem('token', user.token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    validateInviteToken(token: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.invitationUrl}/validate/${token}`);
    }

    getInvitation(token: string): Observable<any> {
        return this.http.get<any>(`${this.invitationUrl}/${token}`);
    }

    registerWithInvite(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register-invite`, data).pipe(
            tap(user => this.setSession(user))
        );
    }

    createInvitation(email: string, role: string): Observable<any> {
        return this.http.post<any>(this.invitationUrl, { email, role });
    }

    getInvitations(): Observable<any[]> {
        return this.http.get<any[]>(this.invitationUrl);
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
