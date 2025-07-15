import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'stats', pathMatch: 'full' },
  { 
    path: 'stats', 
    loadComponent: () => import('./podiums-container/podiums-container.component').then(c => c.PodiumsContainerComponent)
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
