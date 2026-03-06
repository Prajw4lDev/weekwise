import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ThemeService, DataService } from './services';

/**
 * Root application component for Weekwise.
 * Level 4: Layout shell with theme initialization.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Weekwise';
  private themeService = inject(ThemeService);
  private dataService = inject(DataService);

  ngOnInit(): void {
    this.themeService.init();
  }
}
