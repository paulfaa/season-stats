import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
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
