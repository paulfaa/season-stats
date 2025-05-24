import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaderboardContainerComponent } from './leaderboard-container/leaderboard-container.component';
import { StatsContainerComponent } from './stats-container/stats-container.component';
import { ChartContainerComponent } from './chart-container/chart-container.component';

const routes: Routes = [
  { path: '', redirectTo: 'stats', pathMatch: 'full' },
  { path: 'stats', component: StatsContainerComponent },
  { path: 'charts', component: ChartContainerComponent },
  { path: 'leaderboard', component: LeaderboardContainerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
