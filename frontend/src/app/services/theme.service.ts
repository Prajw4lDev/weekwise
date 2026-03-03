import { Injectable, signal } from '@angular/core';

/**
 * Theme service — toggles between dark and light mode.
 * Persists preference to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly STORAGE_KEY = 'weekwise-theme';

    /** True = dark mode (default), false = light mode. */
    readonly isDark = signal<boolean>(this.loadPreference());

    private loadPreference(): boolean {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        // Default to dark if no preference saved
        return saved !== null ? saved === 'dark' : true;
    }

    /** Toggle between dark and light mode. */
    toggle(): void {
        const newValue = !this.isDark();
        this.isDark.set(newValue);
        localStorage.setItem(this.STORAGE_KEY, newValue ? 'dark' : 'light');
        this.applyTheme();
    }

    /** Apply the current theme to the document. */
    applyTheme(): void {
        const html = document.documentElement;
        if (this.isDark()) {
            html.classList.add('dark-theme');
            html.classList.remove('light-theme');
        } else {
            html.classList.add('light-theme');
            html.classList.remove('dark-theme');
        }
    }

    /** Initialize theme on app startup. */
    init(): void {
        this.applyTheme();
    }
}
