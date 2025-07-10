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

  onTabChange(index: number): void {
    const routes = ['/stats', '/charts', '/leaderboard'];
    this.router.navigate([routes[index]]);
  }
}
