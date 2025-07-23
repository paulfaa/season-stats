import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'podiums', pathMatch: 'full' },
  { 
    path: 'podiums', 
    loadComponent: () => import('./podiums/podiums-container/podiums-container.component').then(c => c.PodiumsContainerComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./stats/stats-container/stats-container.component').then(c => c.StatsContainerComponent)
  },
  { 
    path: 'charts', 
    loadComponent: () => import('./charts/chart-container/chart-container.component').then(c => c.ChartContainerComponent)
  },
  { 
    path: 'leaderboard', 
    loadComponent: () => import('./leaderboard/leaderboard-container/leaderboard-container.component').then(c => c.LeaderboardContainerComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
  },
  { 
    path: '**', 
    redirectTo: 'podiums' 
  }
];
