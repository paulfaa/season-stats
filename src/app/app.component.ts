import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { UpdateDateComponent } from './update-date/update-date.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    UpdateDateComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private router: Router) {}

  title = 'season-stats';

  get selectedTabIndex(): number {
    const url = this.router.url;
    if (url.includes('/podiums')) return 0;
    if (url.includes('/stats')) return 1;
    if (url.includes('/charts')) return 2;
    if (url.includes('/leaderboard')) return 3;
    return 0;
  }

  onTabChange(index: number): void {
    const routes = ['/podiums', '/stats', '/charts', '/leaderboard'];
    this.router.navigate([routes[index]]);
    window.scrollTo(0, 0);
  }
}
