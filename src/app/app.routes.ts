import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'stats', pathMatch: 'full' },
  { 
    path: 'stats', 
    loadComponent: () => import('./stats-container/stats-container.component').then(c => c.StatsContainerComponent)
  },
  { 
    path: 'charts', 
    loadComponent: () => import('./chart-container/chart-container.component').then(c => c.ChartContainerComponent)
  },
  { 
    path: 'leaderboard', 
    loadComponent: () => import('./leaderboard-container/leaderboard-container.component').then(c => c.LeaderboardContainerComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
  },
  { 
    path: '**', 
    redirectTo: 'stats' 
  }
];
